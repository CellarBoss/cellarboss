import { db } from "@utils/database.js";
import {
  insertReturning,
  updateReturning,
  toNumber,
} from "@utils/query-helpers.js";
import type { Bottle, CreateBottle, UpdateBottle } from "@cellarboss/types";

// node-pg and mysql2 return DECIMAL columns as strings; coerce to number
function toBottle<T extends { purchasePrice: number | string }>(
  row: T,
): T & { purchasePrice: number } {
  return { ...row, purchasePrice: toNumber(row.purchasePrice) };
}

export async function list(): Promise<Bottle[]> {
  const rows = await db.selectFrom("bottle").selectAll().execute();
  return rows.map(toBottle);
}

export async function getById(id: number): Promise<Bottle | undefined> {
  const row = await db
    .selectFrom("bottle")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  return row ? toBottle(row) : undefined;
}

export async function getByVintageId(vintageId: number): Promise<Bottle[]> {
  const rows = await db
    .selectFrom("bottle")
    .where("vintageId", "=", vintageId)
    .selectAll()
    .execute();
  return rows.map(toBottle);
}

export async function getCountsByVintageId(vintageId: number) {
  return await db
    .selectFrom("bottle")
    .select((eb) => ["status", eb.fn.count("id").as("count")])
    .where("vintageId", "=", vintageId)
    .groupBy("status")
    .execute();
}

export async function create(data: CreateBottle): Promise<Bottle> {
  const row = await insertReturning(db, "bottle", data);
  return toBottle(row);
}

export async function update(id: number, data: UpdateBottle): Promise<Bottle> {
  const row = await updateReturning(db, "bottle", id, data);
  return toBottle(row);
}

export async function remove(id: number) {
  return await db
    .deleteFrom("bottle")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
