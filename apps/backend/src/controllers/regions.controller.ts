import { db } from "@utils/database.js";
import type { CreateRegion, UpdateRegion } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("region").selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("region")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function create(data: CreateRegion) {
  return await db
    .insertInto("region")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateRegion) {
  return await db
    .updateTable("region")
    .set(data)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom("region")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
