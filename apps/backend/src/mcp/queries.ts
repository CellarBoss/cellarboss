import { db } from "@utils/database.js";
import { toNumber } from "@utils/query-helpers.js";

export interface EnrichedWine {
  id: number; // vintage id — the primary key of this view
  wineId: number;
  name: string;
  type: string;
  winemaker: string;
  region: string | null;
  country: string | null;
  grapes: string[];
  year: number | null;
  drinkFrom: number | null;
  drinkUntil: number | null;
  bottleCounts: Record<string, number>;
  averageScore: number | null;
  noteCount: number;
}

export interface EnrichedBottle {
  id: number;
  purchaseDate: string;
  purchasePrice: number;
  status: string;
  size: string;
  vintageId: number;
  year: number | null;
  drinkFrom: number | null;
  drinkUntil: number | null;
  wineId: number;
  wineName: string;
  wineType: string;
  winemaker: string;
  storageId: number | null;
  storagePath: string | null;
  locationId: number | null;
  location: string | null;
}

function baseWineQuery() {
  return db
    .selectFrom("vintage")
    .innerJoin("wine", "wine.id", "vintage.wineId")
    .innerJoin("winemaker", "winemaker.id", "wine.wineMakerId")
    .leftJoin("region", "region.id", "wine.regionId")
    .leftJoin("country", "country.id", "region.countryId")
    .select([
      "vintage.id as id",
      "vintage.year as year",
      "vintage.drinkFrom as drinkFrom",
      "vintage.drinkUntil as drinkUntil",
      "wine.id as wineId",
      "wine.name as name",
      "wine.type as type",
      "winemaker.name as winemaker",
      "region.name as region",
      "country.name as country",
    ]);
}

type WineRow = Awaited<
  ReturnType<ReturnType<typeof baseWineQuery>["execute"]>
>[number];

async function enrichWineRows(rows: WineRow[]): Promise<EnrichedWine[]> {
  if (rows.length === 0) return [];

  const wineIds = [...new Set(rows.map((r) => r.wineId))];
  const vintageIds = rows.map((r) => r.id);

  const grapeRows = await db
    .selectFrom("winegrape")
    .innerJoin("grape", "grape.id", "winegrape.grapeId")
    .select(["winegrape.wineId as wineId", "grape.name as name"])
    .where("winegrape.wineId", "in", wineIds)
    .execute();
  const grapesByWineId = new Map<number, string[]>();
  for (const { wineId, name } of grapeRows) {
    const grapes = grapesByWineId.get(wineId) ?? [];
    grapes.push(name);
    grapesByWineId.set(wineId, grapes);
  }

  const countRows = await db
    .selectFrom("bottle")
    .select((eb) => ["vintageId", "status", eb.fn.count("id").as("count")])
    .where("vintageId", "in", vintageIds)
    .groupBy(["vintageId", "status"])
    .execute();
  const bottleCountsByVintageId = new Map<number, Record<string, number>>();
  for (const row of countRows) {
    const counts = bottleCountsByVintageId.get(row.vintageId) ?? {};
    counts[row.status] = Number(row.count);
    bottleCountsByVintageId.set(row.vintageId, counts);
  }

  const noteAggRows = await db
    .selectFrom("tastingNote")
    .select((eb) => [
      "vintageId",
      eb.fn.avg("score").as("averageScore"),
      eb.fn.count("id").as("noteCount"),
    ])
    .where("vintageId", "in", vintageIds)
    .groupBy("vintageId")
    .execute();
  const noteAggByVintageId = new Map<
    number,
    { averageScore: number; noteCount: number }
  >();
  for (const row of noteAggRows) {
    noteAggByVintageId.set(row.vintageId, {
      averageScore: toNumber(row.averageScore),
      noteCount: Number(row.noteCount),
    });
  }

  return rows.map((row) => ({
    id: row.id,
    wineId: row.wineId,
    name: row.name,
    type: row.type,
    winemaker: row.winemaker,
    region: row.region,
    country: row.country,
    grapes: grapesByWineId.get(row.wineId) ?? [],
    year: row.year,
    drinkFrom: row.drinkFrom,
    drinkUntil: row.drinkUntil,
    bottleCounts: bottleCountsByVintageId.get(row.id) ?? {},
    averageScore: noteAggByVintageId.get(row.id)?.averageScore ?? null,
    noteCount: noteAggByVintageId.get(row.id)?.noteCount ?? 0,
  }));
}

export async function listEnrichedWines(): Promise<EnrichedWine[]> {
  const rows = await baseWineQuery().execute();
  return enrichWineRows(rows);
}

export async function getEnrichedWine(
  vintageId: number,
): Promise<EnrichedWine | undefined> {
  const row = await baseWineQuery()
    .where("vintage.id", "=", vintageId)
    .executeTakeFirst();
  if (!row) return undefined;
  const [enriched] = await enrichWineRows([row]);
  return enriched;
}

function baseBottleQuery() {
  return db
    .selectFrom("bottle")
    .innerJoin("vintage", "vintage.id", "bottle.vintageId")
    .innerJoin("wine", "wine.id", "vintage.wineId")
    .innerJoin("winemaker", "winemaker.id", "wine.wineMakerId")
    .select([
      "bottle.id as id",
      "bottle.purchaseDate as purchaseDate",
      "bottle.purchasePrice as purchasePrice",
      "bottle.status as status",
      "bottle.size as size",
      "bottle.storageId as storageId",
      "vintage.id as vintageId",
      "vintage.year as year",
      "vintage.drinkFrom as drinkFrom",
      "vintage.drinkUntil as drinkUntil",
      "wine.id as wineId",
      "wine.name as wineName",
      "wine.type as wineType",
      "winemaker.name as winemaker",
    ]);
}

type BottleRow = Awaited<
  ReturnType<ReturnType<typeof baseBottleQuery>["execute"]>
>[number];

// Storage forms a self-referencing tree (storage.parent). Walk from a bottle's
// storage up to the root to build a readable path, e.g. "Cellar > Rack 3 > Shelf 2".
// Location is read from the bottle's immediate storage only (not inherited from
// ancestors), matching how the storage list/detail pages already treat it.
async function buildStorageLookups() {
  const [storages, locations] = await Promise.all([
    db.selectFrom("storage").selectAll().execute(),
    db.selectFrom("location").selectAll().execute(),
  ]);

  const nameById = new Map(storages.map((s) => [s.id, s.name]));
  const parentById = new Map(storages.map((s) => [s.id, s.parent]));
  const locationIdById = new Map(storages.map((s) => [s.id, s.locationId]));
  const locationNameById = new Map(locations.map((l) => [l.id, l.name]));

  function storagePath(storageId: number | null): string | null {
    if (storageId === null) return null;
    const segments: string[] = [];
    const visited = new Set<number>();
    let current: number | null = storageId;
    while (current !== null && !visited.has(current)) {
      visited.add(current);
      const name = nameById.get(current);
      if (!name) break;
      segments.unshift(name);
      current = parentById.get(current) ?? null;
    }
    return segments.length > 0 ? segments.join(" > ") : null;
  }

  function location(storageId: number | null) {
    if (storageId === null) return { locationId: null, location: null };
    const locationId = locationIdById.get(storageId) ?? null;
    return {
      locationId,
      location: locationId ? (locationNameById.get(locationId) ?? null) : null,
    };
  }

  return { storagePath, location };
}

async function enrichBottleRows(rows: BottleRow[]): Promise<EnrichedBottle[]> {
  if (rows.length === 0) return [];

  const { storagePath, location } = await buildStorageLookups();

  return rows.map((row) => ({
    id: row.id,
    purchaseDate: row.purchaseDate,
    purchasePrice: toNumber(row.purchasePrice),
    status: row.status,
    size: row.size,
    vintageId: row.vintageId,
    year: row.year,
    drinkFrom: row.drinkFrom,
    drinkUntil: row.drinkUntil,
    wineId: row.wineId,
    wineName: row.wineName,
    wineType: row.wineType,
    winemaker: row.winemaker,
    storageId: row.storageId,
    storagePath: storagePath(row.storageId),
    ...location(row.storageId),
  }));
}

export async function listEnrichedBottles(): Promise<EnrichedBottle[]> {
  const rows = await baseBottleQuery().execute();
  return enrichBottleRows(rows);
}

export async function getEnrichedBottle(
  id: number,
): Promise<EnrichedBottle | undefined> {
  const row = await baseBottleQuery()
    .where("bottle.id", "=", id)
    .executeTakeFirst();
  if (!row) return undefined;
  const [enriched] = await enrichBottleRows([row]);
  return enriched;
}
