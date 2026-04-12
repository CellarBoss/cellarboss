import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import type { CreateVintage, UpdateVintage } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("vintage").selectAll().execute();
}

export async function getByWineId(wineId: number) {
  return await db
    .selectFrom("vintage")
    .selectAll()
    .where("wineId", "=", wineId)
    .execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("vintage")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
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
