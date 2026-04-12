import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import type { CreateWineMaker, UpdateWineMaker } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("winemaker").selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("winemaker")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function create(data: CreateWineMaker) {
  return await insertReturning(db, "winemaker", data);
}

export async function update(id: number, data: UpdateWineMaker) {
  return await updateReturning(db, "winemaker", id, data);
}

export async function remove(id: number) {
  return await db
    .deleteFrom("winemaker")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
