import { db } from "@utils/database.js";
import { updateReturning } from "@utils/query-helpers.js";
import type { UpdateSetting } from "@cellarboss/types";
import { isUserPreferenceSettingKey } from "./user-preferences.controller.js";

export async function list() {
  const settings = await db.selectFrom("setting").selectAll().execute();
  return settings.filter((setting) => !isUserPreferenceSettingKey(setting.key));
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
