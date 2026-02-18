"use server";

import type {
  WineMaker,
  Country,
  Region,
  Grape,
  Wine,
  Vintage,
} from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";
import { scrapeUrl } from "@/lib/scraper";
import type { WineType, BottleStatus } from "@cellarboss/validators/constants";

// ── Entity value ──────────────────────────────────────────────────────────────

export type EntityValue =
  | { type: "existing"; id: number; name: string }
  | { type: "new"; name: string };

// ── Import preview (result of scraping + entity resolution) ───────────────────

export type ImportPreview = {
  wineName: string;
  year: number | null;
  wineType: WineType | null;
  winemaker: EntityValue | null;
  country: EntityValue | null;
  region: EntityValue | null;
  grapes: EntityValue[];
  pricePerBottle: number | null;
};

// ── Import form state (preview + bottle fields, submitted by user) ────────────

export type ImportFormState = ImportPreview & {
  quantity: number;
  purchaseDate: string;
  storageId: number | null;
  status: BottleStatus;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveEntity<T extends { id: number; name: string }>(
  name: string | null,
  existing: T[]
): EntityValue | null {
  if (!name) return null;
  const found = existing.find(
    (e) => e.name.toLowerCase() === name.toLowerCase()
  );
  return found
    ? { type: "existing", id: found.id, name: found.name }
    : { type: "new", name };
}

// ── scrapeAndResolve ──────────────────────────────────────────────────────────

export async function scrapeAndResolve(
  url: string
): Promise<ApiResult<ImportPreview>> {
  try {
    const scraped = await scrapeUrl(url);

    // Fetch all existing entities in parallel
    const [winemakersRes, countriesRes, regionsRes, grapesRes] =
      await Promise.all([
        makeServerRequest<WineMaker[]>("winemaker", "GET"),
        makeServerRequest<Country[]>("country", "GET"),
        makeServerRequest<Region[]>("region", "GET"),
        makeServerRequest<Grape[]>("grape", "GET"),
      ]);

    if (!winemakersRes.ok) return winemakersRes;
    if (!countriesRes.ok) return countriesRes;
    if (!regionsRes.ok) return regionsRes;
    if (!grapesRes.ok) return grapesRes;

    const winemakers = winemakersRes.data;
    const countries = countriesRes.data;
    const regions = regionsRes.data;
    const grapes = grapesRes.data;

    const preview: ImportPreview = {
      wineName: scraped.wineName ?? "",
      year: scraped.year,
      wineType: scraped.wineType,
      winemaker: resolveEntity(scraped.winemakerName, winemakers),
      country: resolveEntity(scraped.countryName, countries),
      region: resolveEntity(scraped.regionName, regions),
      grapes: scraped.grapeNames
        .map((name) => resolveEntity(name, grapes))
        .filter((v): v is EntityValue => v !== null),
      pricePerBottle: scraped.pricePerBottle,
    };

    return { ok: true, data: preview };
  } catch (err: any) {
    return {
      ok: false,
      error: {
        message: err.message ?? "Failed to scrape URL",
        status: 500,
      },
    };
  }
}

// ── importBottles ─────────────────────────────────────────────────────────────

export async function importBottles(
  state: ImportFormState
): Promise<ApiResult<{ count: number }>> {
  // 1. Country
  let countryId: number | null = null;
  if (state.country) {
    if (state.country.type === "existing") {
      countryId = state.country.id;
    } else {
      const res = await makeServerRequest<Country>(
        "country",
        "POST",
        JSON.stringify({ name: state.country.name })
      );
      if (!res.ok) return res;
      countryId = res.data.id;
    }
  }

  // 2. Region
  let regionId: number | null = null;
  if (state.region) {
    if (state.region.type === "existing") {
      regionId = state.region.id;
    } else {
      const res = await makeServerRequest<Region>(
        "region",
        "POST",
        JSON.stringify({ name: state.region.name, countryId })
      );
      if (!res.ok) return res;
      regionId = res.data.id;
    }
  }

  // 3. Winemaker
  let wineMakerId: number;
  if (!state.winemaker) {
    return {
      ok: false,
      error: { message: "Winemaker is required", status: 400 },
    };
  }
  if (state.winemaker.type === "existing") {
    wineMakerId = state.winemaker.id;
  } else {
    const res = await makeServerRequest<WineMaker>(
      "winemaker",
      "POST",
      JSON.stringify({ name: state.winemaker.name })
    );
    if (!res.ok) return res;
    wineMakerId = res.data.id;
  }

  // 4. Grapes (create any new ones)
  const grapeIds: number[] = [];
  for (const grape of state.grapes) {
    if (grape.type === "existing") {
      grapeIds.push(grape.id);
    } else {
      const res = await makeServerRequest<Grape>(
        "grape",
        "POST",
        JSON.stringify({ name: grape.name })
      );
      if (!res.ok) return res;
      grapeIds.push(res.data.id);
    }
  }

  // 5. Wine — find existing by name + wineMakerId, or create
  const winesRes = await makeServerRequest<Wine[]>("wine", "GET");
  if (!winesRes.ok) return winesRes;

  const existingWine = winesRes.data.find(
    (w) =>
      w.name.toLowerCase() === state.wineName.toLowerCase() &&
      w.wineMakerId === wineMakerId
  );

  let wineId: number;
  if (existingWine) {
    wineId = existingWine.id;
  } else {
    const res = await makeServerRequest<Wine>(
      "wine",
      "POST",
      JSON.stringify({
        name: state.wineName,
        type: state.wineType ?? "red",
        wineMakerId,
        regionId,
      })
    );
    if (!res.ok) return res;
    wineId = res.data.id;
  }

  // 6. WineGrape associations — skip any already linked
  const existingWineGrapesRes = await makeServerRequest<
    { id: number; wineId: number; grapeId: number }[]
  >("winegrape/wine/" + wineId, "GET");
  if (!existingWineGrapesRes.ok) return existingWineGrapesRes;

  const linkedGrapeIds = new Set(
    existingWineGrapesRes.data.map((wg) => wg.grapeId)
  );
  for (const grapeId of grapeIds) {
    if (!linkedGrapeIds.has(grapeId)) {
      const res = await makeServerRequest(
        "winegrape",
        "POST",
        JSON.stringify({ wineId, grapeId })
      );
      if (!res.ok) return res;
    }
  }

  // 7. Vintage — find existing by wineId + year, or create
  const vintagesRes = await makeServerRequest<Vintage[]>(
    "vintage/wine/" + wineId,
    "GET"
  );
  if (!vintagesRes.ok) return vintagesRes;

  const existingVintage = vintagesRes.data.find(
    (v) => v.year === state.year
  );

  let vintageId: number;
  if (existingVintage) {
    vintageId = existingVintage.id;
  } else {
    const res = await makeServerRequest<Vintage>(
      "vintage",
      "POST",
      JSON.stringify({
        wineId,
        year: state.year,
        drinkFrom: null,
        drinkUntil: null,
      })
    );
    if (!res.ok) return res;
    vintageId = res.data.id;
  }

  // 8. Create bottles
  const bottleBody = {
    vintageId,
    purchaseDate: state.purchaseDate,
    purchasePrice: state.pricePerBottle ?? 0,
    storageId: state.storageId,
    status: state.status,
  };

  for (let i = 0; i < state.quantity; i++) {
    const res = await makeServerRequest(
      "bottle",
      "POST",
      JSON.stringify(bottleBody)
    );
    if (!res.ok) return res;
  }

  return { ok: true, data: { count: state.quantity } };
}
