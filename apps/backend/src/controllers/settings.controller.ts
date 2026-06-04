import { db } from "@utils/database.js";
import { updateReturning } from "@utils/query-helpers.js";
import type { UpdateSetting } from "@cellarboss/types";
import { USER_PREFERENCE_STORAGE_PREFIX } from "./user-preferences.controller.js";

export async function list() {
  return await db
    .selectFrom("setting")
    .selectAll()
    .where("key", "not like", `${USER_PREFERENCE_STORAGE_PREFIX}%`)
    .execute();
}

export async function getByKey(key: string) {
  return await db
    .selectFrom("setting")
    .selectAll()
    .where("key", "=", key)
    .executeTakeFirst();
}

export async function update(key: string, data: UpdateSetting) {
  return await updateReturning(db, "setting", key, data, "key");
}
