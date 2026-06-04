import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import type { CreateVintage, UpdateVintage, Vintage } from "@cellarboss/types";

type VintageRow = Omit<Vintage, "notes"> & { notes: string | null };

function toVintage(row: VintageRow): Vintage {
  return {
    ...row,
    notes: row.notes ?? "",
  };
}

export async function list() {
  const rows = await db.selectFrom("vintage").selectAll().execute();
  return rows.map(toVintage);
}

export async function getByWineId(wineId: number) {
  const rows = await db
    .selectFrom("vintage")
    .selectAll()
    .where("wineId", "=", wineId)
    .execute();
  return rows.map(toVintage);
}

export async function getById(id: number) {
  const row = await db
    .selectFrom("vintage")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  return row ? toVintage(row) : undefined;
}

export async function create(data: CreateVintage) {
  const row = await insertReturning(db, "vintage", data);
  return toVintage(row);
}

export async function update(id: number, data: UpdateVintage) {
  const row = await updateReturning(db, "vintage", id, data);
  return toVintage(row);
}

export async function remove(id: number) {
  return await db
    .deleteFrom("vintage")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
