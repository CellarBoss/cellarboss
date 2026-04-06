import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import type { CreateWineGrape, UpdateWineGrape } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("winegrape").selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("winegrape")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function getByWineId(wineId: number) {
  return await db
    .selectFrom("winegrape")
    .selectAll()
    .where("wineId", "=", wineId)
    .execute();
}

export async function create(data: CreateWineGrape) {
  return await insertReturning(db, "winegrape", data);
}

export async function update(id: number, data: UpdateWineGrape) {
  return await updateReturning(db, "winegrape", id, data);
}

export async function remove(id: number) {
  return await db
    .deleteFrom("winegrape")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
