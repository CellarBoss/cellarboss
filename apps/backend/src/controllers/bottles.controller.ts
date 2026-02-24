import { db } from "@utils/database.js";
import type { CreateBottle, UpdateBottle } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("bottle").selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("bottle")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function getByVintageId(vintageId: number) {
  return await db
    .selectFrom("bottle")
    .where("vintageId", "=", vintageId)
    .selectAll()
    .execute();
}

export async function getCountsByVintageId(vintageId: number) {
  return await db
    .selectFrom("bottle")
    .select((eb) => ["status", eb.fn.count("id").as("count")])
    .where("vintageId", "=", vintageId)
    .groupBy("status")
    .execute();
}

export async function create(data: CreateBottle) {
  return await db
    .insertInto("bottle")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update(id: number, data: UpdateBottle) {
  return await db
    .updateTable("bottle")
    .set(data)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  return await db
    .deleteFrom("bottle")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
