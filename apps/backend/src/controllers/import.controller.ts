import type { Transaction } from "kysely";
import type {
  ImportCommit,
  ImportCommitResult,
  ImportEntityRef,
  ImportedWineDetails,
  ImportPreview,
  ImportSite,
} from "@cellarboss/types";
import type { Database } from "@schema/database.js";
import { db } from "@utils/database.js";
import { insertReturning } from "@utils/query-helpers.js";
import { logger } from "@utils/logger.js";
import {
  RemoteFetchError,
  SafeFetcher,
  type FetchFailureReason,
} from "@utils/fetch-remote.js";
import {
  buildContext,
  foldKey,
  ImporterRegistry,
  reconcileWine,
  type BaseImporter,
  type Fetcher,
  type ImportedWine,
  type Strategy,
} from "../import/index.js";

/** Why a preview failed. Logged with the request; clients only see IMPORT_FAILED. */
export type ImportFailureReason =
  | FetchFailureReason
  | "parse_error"
  | "adapter_error"
  | "no_fields"
  | "rate_limited";

export type PreviewResult =
  | { ok: true; preview: ImportPreview }
  | { ok: false; reason: ImportFailureReason };

interface Attempt {
  strategy: Strategy | "cache";
  url: string;
  outcome: "ok" | ImportFailureReason;
  status?: number;
  ms: number;
}

interface PageData {
  html: string;
  api: { url: string; body: string }[];
}

const registry = new ImporterRegistry();

export function sites(): ImportSite[] {
  return registry.sites();
}

// ---- Rate limit and cache (per process) ----

const RATE_LIMIT = { max: 10, windowMs: 60_000 };
const recentByUser = new Map<string, number[]>();

function isRateLimited(userId: string, now = Date.now()): boolean {
  const recent = (recentByUser.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT.windowMs,
  );
  if (recent.length >= RATE_LIMIT.max) {
    recentByUser.set(userId, recent);
    return true;
  }
  recent.push(now);
  recentByUser.set(userId, recent);
  return false;
}

const CACHE = { ttlMs: 10 * 60_000, maxEntries: 50 };
const pageCache = new Map<string, PageData & { expires: number }>();

function cacheKey(url: URL): string {
  const copy = new URL(url);
  copy.hash = "";
  return copy.href;
}

function cacheGet(url: URL): PageData | undefined {
  const entry = pageCache.get(cacheKey(url));
  if (!entry || entry.expires < Date.now()) return undefined;
  return entry;
}

function cacheSet(url: URL, data: PageData) {
  if (pageCache.size >= CACHE.maxEntries) {
    pageCache.delete(pageCache.keys().next().value!);
  }
  pageCache.set(cacheKey(url), { ...data, expires: Date.now() + CACHE.ttlMs });
}

/** Clears rate-limit and cache state. For tests. */
export function resetImportState() {
  recentByUser.clear();
  pageCache.clear();
}

// ---- Preview ----

/** Only the path is logged: query strings can carry tracking or session ids. */
function loggableUrl(url: URL | string): string {
  const u = new URL(url);
  return `${u.origin}${u.pathname}`;
}

function reasonOf(error: unknown): ImportFailureReason {
  return error instanceof RemoteFetchError ? error.reason : "adapter_error";
}

/** Fetches the page and API data for an importer, trying its strategies in order. */
async function gather(
  importer: BaseImporter,
  url: URL,
  fetcher: Fetcher,
  attempts: Attempt[],
): Promise<PageData> {
  const data: PageData = { html: "", api: [] };
  const fetched = new Set<string>();

  const fetchApi = async (html: string) => {
    const requests = importer
      .apiRequests(buildContext({ url, html }))
      .filter((u) => u.hostname === url.hostname || importer.canHandle(u))
      .filter((u) => !fetched.has(u.href));
    for (const apiUrl of requests) {
      fetched.add(apiUrl.href);
      const started = Date.now();
      try {
        const doc = await fetcher.fetch({ url: apiUrl, accept: "json" });
        data.api.push({ url: doc.url.href, body: doc.body });
        attempts.push({
          strategy: "api",
          url: loggableUrl(apiUrl),
          outcome: "ok",
          ms: Date.now() - started,
        });
      } catch (error) {
        attempts.push({
          strategy: "api",
          url: loggableUrl(apiUrl),
          outcome: reasonOf(error),
          status: error instanceof RemoteFetchError ? error.status : undefined,
          ms: Date.now() - started,
        });
      }
    }
  };

  const useApi = importer.strategies.includes("api");
  if (useApi) await fetchApi("");

  const hasApiData = data.api.length > 0;
  const complete =
    hasApiData &&
    importer.missing(
      importer.extract(buildContext({ url, html: "", api: data.api })),
    ).length === 0;

  if (!complete && importer.strategies.includes("http")) {
    const started = Date.now();
    try {
      const doc = await fetcher.fetch({ url, accept: "html" });
      data.html = doc.contentType === "html" ? doc.body : "";
      attempts.push({
        strategy: "http",
        url: loggableUrl(url),
        outcome: "ok",
        ms: Date.now() - started,
      });
      if (useApi) await fetchApi(data.html);
    } catch (error) {
      attempts.push({
        strategy: "http",
        url: loggableUrl(url),
        outcome: reasonOf(error),
        status: error instanceof RemoteFetchError ? error.status : undefined,
        ms: Date.now() - started,
      });
      if (!hasApiData) throw error;
    }
  }
  return data;
}

/** Drops server-only fields before a result goes to a client. */
function toDetails(wine: ImportedWine): ImportedWineDetails {
  const { diagnostics, bottle, ...details } = wine;
  void diagnostics;
  void bottle;
  return details;
}

async function loadLookups() {
  const [winemakers, countries, regions, grapes] = await Promise.all([
    db.selectFrom("winemaker").select(["id", "name"]).execute(),
    db.selectFrom("country").select(["id", "name"]).execute(),
    db.selectFrom("region").select(["id", "name", "countryId"]).execute(),
    db.selectFrom("grape").select(["id", "name"]).execute(),
  ]);
  return { winemakers, countries, regions, grapes };
}

/** Finds the wine and vintage when the import would duplicate them (decision 5). */
async function findExisting(
  wine: ImportedWine,
  winemakerId: number | undefined,
): Promise<ImportPreview["existing"]> {
  if (winemakerId === undefined || !wine.name)
    return { wine: null, vintage: null };

  const key = foldKey(wine.name.value);
  const wines = await db
    .selectFrom("wine")
    .select(["id", "name"])
    .where("wineMakerId", "=", winemakerId)
    .execute();
  const existingWine = wines.find((w) => foldKey(w.name) === key) ?? null;
  if (!existingWine || wine.vintage?.year === undefined) {
    return { wine: existingWine, vintage: null };
  }

  const year = wine.vintage.year.value;
  let query = db
    .selectFrom("vintage")
    .select(["id", "year"])
    .where("wineId", "=", existingWine.id);
  query =
    year === null
      ? query.where("year", "is", null)
      : query.where("year", "=", year);
  const vintage = (await query.executeTakeFirst()) ?? null;
  return { wine: existingWine, vintage };
}

export interface PreviewInput {
  url: string;
  html?: string;
}

/**
 * Reads a page and matches it against existing records. Writes nothing. Any
 * failure returns one generic result; the reason goes to the log only.
 */
export async function preview(
  input: PreviewInput,
  userId: string,
  fetcher: Fetcher = new SafeFetcher(),
): Promise<PreviewResult> {
  const started = Date.now();
  const url = new URL(input.url);
  const importer = registry.forUrl(url);
  const attempts: Attempt[] = [];
  const log = (outcome: ImportFailureReason | "ok", wine?: ImportedWine) => {
    const entry = logger.withMetadata({
      import: {
        userId,
        importer: importer.id,
        host: url.hostname,
        url: loggableUrl(url),
        outcome,
        attempts,
        found: wine
          ? Object.keys(toDetails(wine)).filter(
              (k) =>
                !["sourceUrl", "importerId"].includes(k) &&
                wine[k as keyof ImportedWine] !== undefined,
            )
          : [],
        missing: wine ? importer.missing(wine) : [],
        diagnostics: wine?.diagnostics ?? [],
        durationMs: Date.now() - started,
      },
    });
    if (outcome === "ok") entry.info("Import preview");
    else entry.warn("Import preview failed");
  };

  if (isRateLimited(userId)) {
    log("rate_limited");
    return { ok: false, reason: "rate_limited" };
  }

  let data: PageData;
  if (input.html !== undefined) {
    data = { html: input.html, api: [] };
    attempts.push({
      strategy: "supplied",
      url: loggableUrl(url),
      outcome: "ok",
      ms: 0,
    });
  } else {
    const cached = cacheGet(url);
    if (cached) {
      data = cached;
      attempts.push({
        strategy: "cache",
        url: loggableUrl(url),
        outcome: "ok",
        ms: 0,
      });
    } else {
      try {
        data = await gather(importer, url, fetcher, attempts);
      } catch (error) {
        const reason = reasonOf(error);
        log(reason);
        return { ok: false, reason };
      }
      cacheSet(url, data);
    }
  }

  let wine: ImportedWine;
  try {
    wine = importer.extract(
      buildContext({ url, html: data.html, api: data.api }),
    );
  } catch (error) {
    logger.withError(error as Error).warn("Import extraction threw");
    log("parse_error");
    return { ok: false, reason: "parse_error" };
  }

  if (!wine.name) {
    log("no_fields", wine);
    return { ok: false, reason: "no_fields" };
  }

  const resolution = reconcileWine(wine, await loadLookups());
  const existing = await findExisting(
    wine,
    resolution.winemaker.status === "matched"
      ? resolution.winemaker.id
      : undefined,
  );

  log("ok", wine);
  return { ok: true, preview: { wine: toDetails(wine), resolution, existing } };
}

// ---- Commit ----

export class ImportCommitError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404,
  ) {
    super(message);
    this.name = "ImportCommitError";
  }
}

type Trx = Transaction<Database>;
type NamedTable = "winemaker" | "country" | "grape";

/** An existing id (checked), or the id of a record with that name, created if needed. */
async function resolveRef(
  trx: Trx,
  table: NamedTable,
  ref: ImportEntityRef,
): Promise<number> {
  if ("id" in ref) {
    const row = await trx
      .selectFrom(table)
      .select("id")
      .where("id", "=", ref.id)
      .executeTakeFirst();
    if (!row) throw new ImportCommitError(`${table} ${ref.id} not found`, 404);
    return row.id;
  }
  // Re-check by name inside the transaction so a repeat submit or a record
  // created since the preview is reused. This doesn't stop two commits that
  // run at the same moment on Postgres or MySQL from both inserting: names
  // match accent- and case-insensitively, which a unique index can't express.
  const key = foldKey(ref.name);
  const rows = await trx.selectFrom(table).select(["id", "name"]).execute();
  const match = rows.find((row) => foldKey(row.name) === key);
  if (match) return match.id;
  const created = await insertReturning(trx, table, { name: ref.name.trim() });
  return created.id;
}

async function resolveRegion(
  trx: Trx,
  ref: ImportEntityRef,
  countryId: number | null,
): Promise<number> {
  if ("id" in ref) {
    const row = await trx
      .selectFrom("region")
      .select("id")
      .where("id", "=", ref.id)
      .executeTakeFirst();
    if (!row) throw new ImportCommitError(`region ${ref.id} not found`, 404);
    return row.id;
  }
  if (countryId === null)
    throw new ImportCommitError("A new region needs a country", 400);
  const key = foldKey(ref.name);
  const rows = await trx
    .selectFrom("region")
    .select(["id", "name"])
    .where("countryId", "=", countryId)
    .execute();
  const match = rows.find((row) => foldKey(row.name) === key);
  if (match) return match.id;
  const created = await insertReturning(trx, "region", {
    name: ref.name.trim(),
    countryId,
  });
  return created.id;
}

async function resolveWine(
  trx: Trx,
  wine: ImportCommit["wine"],
): Promise<number> {
  if ("id" in wine) {
    const row = await trx
      .selectFrom("wine")
      .select("id")
      .where("id", "=", wine.id)
      .executeTakeFirst();
    if (!row) throw new ImportCommitError(`wine ${wine.id} not found`, 404);
    return row.id;
  }

  const wineMakerId = await resolveRef(trx, "winemaker", wine.winemaker);
  const countryId = wine.country
    ? await resolveRef(trx, "country", wine.country)
    : null;
  const regionId = wine.region
    ? await resolveRegion(trx, wine.region, countryId)
    : null;

  const key = foldKey(wine.name);
  const sameMaker = await trx
    .selectFrom("wine")
    .select(["id", "name"])
    .where("wineMakerId", "=", wineMakerId)
    .execute();
  const existing = sameMaker.find((w) => foldKey(w.name) === key);
  if (existing) return existing.id;

  const created = await insertReturning(trx, "wine", {
    name: wine.name.trim(),
    type: wine.type,
    wineMakerId,
    regionId,
  });

  const grapeIds = new Set<number>();
  for (const grape of wine.grapes)
    grapeIds.add(await resolveRef(trx, "grape", grape));
  for (const grapeId of grapeIds) {
    await trx
      .insertInto("winegrape")
      .values({ wineId: created.id, grapeId })
      .execute();
  }
  return created.id;
}

/**
 * Creates everything an import needs in one transaction: winemaker, country,
 * region and grapes when new, then the wine and vintage. If the vintage
 * already exists nothing is created and its id is returned.
 */
export async function commit(input: ImportCommit): Promise<ImportCommitResult> {
  return await db.transaction().execute(async (trx) => {
    const wineId = await resolveWine(trx, input.wine);
    const { year, drinkFrom, drinkUntil } = input.vintage;

    let query = trx
      .selectFrom("vintage")
      .select("id")
      .where("wineId", "=", wineId);
    query =
      year === null
        ? query.where("year", "is", null)
        : query.where("year", "=", year);
    const existing = await query.executeTakeFirst();
    if (existing) return { wineId, vintageId: existing.id, created: false };

    const vintage = await insertReturning(trx, "vintage", {
      wineId,
      year,
      drinkFrom,
      drinkUntil,
    });
    return { wineId, vintageId: vintage.id, created: true };
  });
}
