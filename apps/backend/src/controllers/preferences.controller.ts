import { db } from "@utils/database.js";
import { env } from "@utils/env.js";
import type { UpsertPreference } from "@cellarboss/types";

export async function listForUser(userId: string) {
  return await db
    .selectFrom("preference")
    .selectAll()
    .where("userId", "=", userId)
    .execute();
}

export async function getByKey(userId: string, key: string) {
  return await db
    .selectFrom("preference")
    .selectAll()
    .where("userId", "=", userId)
    .where("key", "=", key)
    .executeTakeFirst();
}

export async function upsert(
  userId: string,
  key: string,
  data: UpsertPreference,
) {
  const record = { userId, key, value: data.value };

  if (env.DATABASE_TYPE === "mysql") {
    // MySQL: INSERT ... ON DUPLICATE KEY UPDATE
    await (db as any)
      .insertInto("preference")
      .values(record)
      .onDuplicateKeyUpdate({ value: data.value })
      .execute();
  } else {
    // SQLite / PostgreSQL: INSERT ... ON CONFLICT DO UPDATE
    await db
      .insertInto("preference")
      .values(record)
      .onConflict((oc) =>
        oc.columns(["userId", "key"]).doUpdateSet({ value: data.value }),
      )
      .execute();
  }

  return await db
    .selectFrom("preference")
    .selectAll()
    .where("userId", "=", userId)
    .where("key", "=", key)
    .executeTakeFirstOrThrow();
}

export async function remove(userId: string, key: string) {
  await db
    .deleteFrom("preference")
    .where("userId", "=", userId)
    .where("key", "=", key)
    .execute();
}
