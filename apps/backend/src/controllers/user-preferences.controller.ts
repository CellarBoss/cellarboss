import type { JsonValue, UserPreference } from "@cellarboss/types";
import { db } from "@utils/database.js";

const STORAGE_PREFIX = "userPreference:";

export function isUserPreferenceSettingKey(key: string) {
  return key.startsWith(STORAGE_PREFIX);
}

function storageKey(userId: string, key: string) {
  return `${STORAGE_PREFIX}${userId}:${key}`;
}

function parsePreferenceValue(value: string): JsonValue {
  return JSON.parse(value) as JsonValue;
}

function toUserPreference(key: string, row: { value: string }): UserPreference {
  return {
    key,
    value: parsePreferenceValue(row.value),
  };
}

export async function getByKey(
  userId: string,
  key: string,
): Promise<UserPreference | undefined> {
  const row = await db
    .selectFrom("setting")
    .select(["value"])
    .where("key", "=", storageKey(userId, key))
    .executeTakeFirst();

  return row ? toUserPreference(key, row) : undefined;
}

export async function upsert(
  userId: string,
  key: string,
  value: JsonValue,
): Promise<UserPreference> {
  const storedKey = storageKey(userId, key);
  const storedValue = JSON.stringify(value);
  const existing = await db
    .selectFrom("setting")
    .select("key")
    .where("key", "=", storedKey)
    .executeTakeFirst();

  if (existing) {
    await db
      .updateTable("setting")
      .set({ value: storedValue })
      .where("key", "=", storedKey)
      .execute();
  } else {
    await db
      .insertInto("setting")
      .values({ key: storedKey, value: storedValue })
      .execute();
  }

  return { key, value };
}

export async function remove(userId: string, key: string): Promise<boolean> {
  const result = await db
    .deleteFrom("setting")
    .where("key", "=", storageKey(userId, key))
    .executeTakeFirst();

  return Number(result.numDeletedRows ?? 0) > 0;
}
