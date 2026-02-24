import { db } from "@utils/database.js";
import type { CreateGrape, UpdateGrape } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("grape").selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("grape")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function create(data: CreateGrape) {
  return await db
    .insertInto("grape")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateGrape) {
  return await db
    .updateTable("grape")
    .set(data)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom("grape")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
