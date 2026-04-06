import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import type { CreateCountry, UpdateCountry } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("country").selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("country")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function create(data: CreateCountry) {
  return await insertReturning(db, "country", data);
}

export async function update(id: number, data: UpdateCountry) {
  return await updateReturning(db, "country", id, data);
}

export async function remove(id: number) {
  return await db
    .deleteFrom("country")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
