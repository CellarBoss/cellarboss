import type { JsonValue, UserPreference } from "@cellarboss/types";
import { jsonValueSchema } from "@cellarboss/validators";
import { db } from "@utils/database.js";
import { env } from "@utils/env.js";

export const USER_PREFERENCE_STORAGE_PREFIX = "userPreference:";

export function isUserPreferenceSettingKey(key: string) {
  return key.startsWith(USER_PREFERENCE_STORAGE_PREFIX);
}

function storageKey(userId: string, key: string) {
  return `${USER_PREFERENCE_STORAGE_PREFIX}${userId}:${key}`;
}

function parsePreferenceValue(value: string): JsonValue {
  const parsed = JSON.parse(value);
  const result = jsonValueSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Stored user preference value failed JSON validation");
  }
  return result.data;
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
  const query = db
    .insertInto("setting")
    .values({ key: storedKey, value: storedValue });
  await (
    env.DATABASE_TYPE === "mysql"
      ? query.onDuplicateKeyUpdate({ value: storedValue })
      : query.onConflict((oc) =>
          oc.column("key").doUpdateSet({ value: storedValue }),
        )
  ).execute();

  return { key, value };
}

export async function remove(userId: string, key: string): Promise<boolean> {
  const result = await db
    .deleteFrom("setting")
    .where("key", "=", storageKey(userId, key))
    .executeTakeFirst();

  return Number(result.numDeletedRows ?? 0) > 0;
}
