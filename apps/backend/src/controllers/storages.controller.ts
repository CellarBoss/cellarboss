import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import type { CreateStorage, UpdateStorage } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("storage").selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("storage")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function create(data: CreateStorage) {
  return await insertReturning(db, "storage", data);
}

export async function update(id: number, data: UpdateStorage) {
  return await updateReturning(db, "storage", id, data);
}

export async function remove(id: number) {
  return await db
    .deleteFrom("storage")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
