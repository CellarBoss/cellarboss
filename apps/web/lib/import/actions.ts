"use server";

import type { ApiError, ApiResult } from "@cellarboss/common";
import { getCountries, createCountry } from "@/lib/api/countries";
import { getRegions, createRegion } from "@/lib/api/regions";
import { getWinemakers, createWinemaker } from "@/lib/api/winemakers";
import { getGrapes, createGrape } from "@/lib/api/grapes";
import { getWines, createWine } from "@/lib/api/wines";
import { createWineGrape } from "@/lib/api/winegrapes";
import { createVintage } from "@/lib/api/vintages";
import { createBottle } from "@/lib/api/bottles";
import { scrape } from "./scrape";
import {
  matchCountry,
  matchManyByName,
  matchRegion,
  matchWine,
  matchWinemaker,
} from "./match/matcher";
import { reconciledImportSchema, scrapeRequestSchema } from "./schema";
import type {
  ImportDraft,
  ImportResult,
  ReconciledImport,
  ResolvedEntity,
} from "./types";

/** Internal error carrying an ApiError so the chain can unwind to ApiResult. */
class CreateError extends Error {
  apiError: ApiError;
  constructor(apiError: ApiError) {
    super(apiError.message);
    this.apiError = apiError;
  }
}

/**
 * Stage 1 + 2: scrape a URL and match the result against existing records,
 * returning a draft for the user to reconcile. Never creates anything.
 */
export async function scrapeUrl(
  rawUrl: string,
): Promise<ApiResult<ImportDraft>> {
  const parsed = scrapeRequestSchema.safeParse({ url: rawUrl });
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        message: parsed.error.issues[0]?.message ?? "Invalid URL",
        status: 400,
      },
    };
  }

  let result;
  try {
    result = await scrape(parsed.data.url);
  } catch (err) {
    return {
      ok: false,
      error: {
        message:
          err instanceof Error ? err.message : "Failed to read that page",
        status: 422,
      },
    };
  }

  const [countriesRes, regionsRes, winemakersRes, grapesRes, winesRes] =
    await Promise.all([
      getCountries(),
      getRegions(),
      getWinemakers(),
      getGrapes(),
      getWines(),
    ]);

  for (const res of [
    countriesRes,
    regionsRes,
    winemakersRes,
    grapesRes,
    winesRes,
  ]) {
    if (!res.ok) return res as ApiResult<ImportDraft>;
  }
  // Narrowed by the guard above.
  const countries = (countriesRes as Extract<typeof countriesRes, { ok: true }>)
    .data;
  const regions = (regionsRes as Extract<typeof regionsRes, { ok: true }>).data;
  const winemakers = (
    winemakersRes as Extract<typeof winemakersRes, { ok: true }>
  ).data;
  const grapes = (grapesRes as Extract<typeof grapesRes, { ok: true }>).data;
  const wines = (winesRes as Extract<typeof winesRes, { ok: true }>).data;

  const { wine } = result;
  const countryMatch = matchCountry(wine.country, countries);
  const regionMatch = matchRegion(wine.region, countryMatch.matchId, regions);
  const winemakerMatch = matchWinemaker(wine.winemaker, winemakers);
  const wineMatch = matchWine(wine.name, winemakerMatch.matchId, wines);
  const grapeMatches = matchManyByName(wine.grapes, grapes);

  const draft: ImportDraft = {
    sourceUrl: result.sourceUrl,
    adapterId: result.adapterId,
    adapterLabel: result.adapterLabel,
    scraped: wine,
    suggestions: {
      wineId: wineMatch.matchId,
      countryId: countryMatch.matchId,
      regionId: regionMatch.matchId,
      winemakerId: winemakerMatch.matchId,
      grapeIds: grapeMatches.map((m) => m.matchId),
      candidates: {
        country: countryMatch.candidates,
        region: regionMatch.candidates,
        winemaker: winemakerMatch.candidates,
        wine: wineMatch.candidates,
      },
    },
  };

  return { ok: true, data: draft };
}

async function resolveEntity(
  entity: ResolvedEntity,
  create: (name: string) => Promise<ApiResult<{ id: number; name: string }>>,
  label: string,
): Promise<number> {
  if (entity.existingId != null) return entity.existingId;
  if (!entity.newName) {
    throw new CreateError({
      message: `Missing ${label} selection`,
      status: 400,
    });
  }
  const res = await create(entity.newName);
  if (!res.ok) {
    throw new CreateError({
      ...res.error,
      message: `Couldn't create ${label} "${entity.newName}": ${res.error.message}`,
    });
  }
  return res.data.id;
}

/**
 * Stage 3 + 4: create any new dependent entities (winemaker, country, region,
 * wine, grapes) then create the requested bottle(s). Entities are created in FK
 * order; the bottle is only created once the wine/vintage chain succeeds.
 */
export async function createFromDraft(
  input: ReconciledImport,
): Promise<ApiResult<ImportResult>> {
  const parsed = reconciledImportSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: {
        message: issue?.message ?? "Invalid import data",
        status: 400,
      },
    };
  }
  const data = parsed.data;

  try {
    let wineId: number;

    if (data.existingWineId != null) {
      wineId = data.existingWineId;
    } else {
      if (!data.winemaker) {
        throw new CreateError({
          message: "A winemaker is required for a new wine",
          status: 400,
        });
      }
      const wineMakerId = await resolveEntity(
        data.winemaker,
        (name) => createWinemaker({ id: 0, name }),
        "winemaker",
      );

      let regionId: number | null = null;
      if (data.region) {
        if (data.region.existingId != null) {
          regionId = data.region.existingId;
        } else if (data.region.newName) {
          // Schema guarantees a country is present here.
          const countryId = await resolveEntity(
            data.country!,
            (name) => createCountry({ id: 0, name }),
            "country",
          );
          const regionRes = await createRegion({
            id: 0,
            name: data.region.newName,
            countryId,
          });
          if (!regionRes.ok) {
            throw new CreateError({
              ...regionRes.error,
              message: `Couldn't create region "${data.region.newName}": ${regionRes.error.message}`,
            });
          }
          regionId = regionRes.data.id;
        }
      }

      const wineRes = await createWine({
        id: 0,
        name: data.wine.name,
        type: data.wine.type,
        wineMakerId,
        regionId,
      });
      if (!wineRes.ok) {
        throw new CreateError(wineRes.error);
      }
      wineId = wineRes.data.id;

      for (const grape of data.grapes) {
        const grapeId = await resolveEntity(
          grape,
          (name) => createGrape({ id: 0, name }),
          "grape",
        );
        const linkRes = await createWineGrape({ wineId, grapeId });
        if (!linkRes.ok) {
          throw new CreateError(linkRes.error);
        }
      }
    }

    const vintageRes = await createVintage({
      wineId,
      year: data.vintage.year,
      drinkFrom: data.vintage.drinkFrom,
      drinkUntil: data.vintage.drinkUntil,
    });
    if (!vintageRes.ok) {
      throw new CreateError(vintageRes.error);
    }
    const vintageId = vintageRes.data.id;

    const bottleIds: number[] = [];
    for (let i = 0; i < data.bottle.quantity; i++) {
      const bottleRes = await createBottle({
        purchaseDate: data.bottle.purchaseDate,
        purchasePrice: data.bottle.purchasePrice,
        vintageId,
        storageId: data.bottle.storageId,
        status: data.bottle.status,
        size: data.bottle.size,
      });
      if (!bottleRes.ok) {
        throw new CreateError({
          ...bottleRes.error,
          message: `Created the wine and vintage, but failed on bottle ${i + 1} of ${data.bottle.quantity}: ${bottleRes.error.message}`,
        });
      }
      bottleIds.push(bottleRes.data.id);
    }

    return { ok: true, data: { wineId, vintageId, bottleIds } };
  } catch (err) {
    if (err instanceof CreateError) {
      return { ok: false, error: err.apiError };
    }
    return {
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "Import failed",
        status: 500,
      },
    };
  }
}
