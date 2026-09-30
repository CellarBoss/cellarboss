import { db } from "@utils/database.js";
import { BOTTLE_STATUSES } from "@cellarboss/validators";
import type { BottleCounts } from "@cellarboss/types";

// Batched count helpers used to embed aggregates in read responses without
// per-row queries. COUNT() comes back as a string on Postgres (and MySQL for
// bigint), so every count is passed through Number().

export function emptyBottleCounts(): BottleCounts {
  return Object.fromEntries(
    BOTTLE_STATUSES.map((status) => [status, 0]),
  ) as BottleCounts;
}

/**
 * Bottle counts by status for each vintage, zero-filled for every status.
 * Pass `undefined` to count across all vintages.
 */
export async function bottleCountsByVintageIds(
  vintageIds?: number[],
): Promise<Map<number, BottleCounts>> {
  const result = new Map<number, BottleCounts>();
  if (vintageIds?.length === 0) return result;

  let query = db
    .selectFrom("bottle")
    .select((eb) => ["vintageId", "status", eb.fn.count("id").as("count")])
    .groupBy(["vintageId", "status"]);
  if (vintageIds) query = query.where("vintageId", "in", vintageIds);

  for (const row of await query.execute()) {
    const counts = result.get(row.vintageId) ?? emptyBottleCounts();
    counts[row.status] = Number(row.count);
    result.set(row.vintageId, counts);
  }
  return result;
}

/**
 * Number of tasting notes for each vintage.
 * Pass `undefined` to count across all vintages.
 */
export async function tastingNoteCountsByVintageIds(
  vintageIds?: number[],
): Promise<Map<number, number>> {
  const result = new Map<number, number>();
  if (vintageIds?.length === 0) return result;

  let query = db
    .selectFrom("tastingNote")
    .select((eb) => ["vintageId", eb.fn.count("id").as("count")])
    .groupBy("vintageId");
  if (vintageIds) query = query.where("vintageId", "in", vintageIds);

  for (const row of await query.execute()) {
    result.set(row.vintageId, Number(row.count));
  }
  return result;
}

/**
 * Number of tasting notes across all vintages of each wine.
 * Pass `undefined` to count across all wines.
 */
export async function tastingNoteCountsByWineIds(
  wineIds?: number[],
): Promise<Map<number, number>> {
  const result = new Map<number, number>();
  if (wineIds?.length === 0) return result;

  let query = db
    .selectFrom("tastingNote")
    .innerJoin("vintage", "vintage.id", "tastingNote.vintageId")
    .select((eb) => [
      "vintage.wineId as wineId",
      eb.fn.count("tastingNote.id").as("count"),
    ])
    .groupBy("vintage.wineId");
  if (wineIds) query = query.where("vintage.wineId", "in", wineIds);

  for (const row of await query.execute()) {
    result.set(row.wineId, Number(row.count));
  }
  return result;
}
