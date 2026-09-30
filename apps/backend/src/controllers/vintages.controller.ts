import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import {
  bottleCountsByVintageIds,
  emptyBottleCounts,
  tastingNoteCountsByVintageIds,
} from "@utils/aggregates.js";
import type {
  CreateVintage,
  UpdateVintage,
  Vintage,
  VintageDetail,
} from "@cellarboss/types";

export async function list(): Promise<VintageDetail[]> {
  const rows = await db.selectFrom("vintage").selectAll().execute();
  // Every vintage is returned, so count across the whole table
  return withCounts(rows, undefined);
}

export async function getByWineId(wineId: number): Promise<VintageDetail[]> {
  const rows = await db
    .selectFrom("vintage")
    .selectAll()
    .where("wineId", "=", wineId)
    .execute();
  return withCounts(
    rows,
    rows.map((r) => r.id),
  );
}

export async function getById(id: number): Promise<VintageDetail | undefined> {
  const row = await db
    .selectFrom("vintage")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  if (!row) return undefined;
  const [detail] = await withCounts([row], [id]);
  return detail;
}

async function withCounts(
  rows: Vintage[],
  vintageIds: number[] | undefined,
): Promise<VintageDetail[]> {
  if (rows.length === 0) return [];
  const [bottleCounts, noteCounts] = await Promise.all([
    bottleCountsByVintageIds(vintageIds),
    tastingNoteCountsByVintageIds(vintageIds),
  ]);
  return rows.map((row) => ({
    ...row,
    tastingNotesCount: noteCounts.get(row.id) ?? 0,
    bottles: bottleCounts.get(row.id) ?? emptyBottleCounts(),
  }));
}

export async function create(data: CreateVintage) {
  return await insertReturning(db, "vintage", data);
}

export async function update(id: number, data: UpdateVintage) {
  return await updateReturning(db, "vintage", id, data);
}

export async function remove(id: number) {
  return await db
    .deleteFrom("vintage")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
