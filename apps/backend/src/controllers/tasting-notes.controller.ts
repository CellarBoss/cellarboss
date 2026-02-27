import { db } from "@utils/database.js";
import type { CreateTastingNote, UpdateTastingNote } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("tastingNote").selectAll().execute();
}

export async function getByVintageId(vintageId: number) {
  return await db
    .selectFrom("tastingNote")
    .selectAll()
    .where("vintageId", "=", vintageId)
    .execute();
}

export async function getByWineId(wineId: number) {
  return await db
    .selectFrom("tastingNote")
    .innerJoin("vintage", "vintage.id", "tastingNote.vintageId")
    .where("vintage.wineId", "=", wineId)
    .selectAll("tastingNote")
    .execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("tastingNote")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function create(
  data: CreateTastingNote & { author: string; date: string },
) {
  return await db
    .insertInto("tastingNote")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateTastingNote) {
  return await db
    .updateTable("tastingNote")
    .set(data)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom("tastingNote")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
