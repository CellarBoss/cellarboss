"use server";

import type { Setting } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getSettings(): Promise<ApiResult<Setting[]>> {
  return api.settings.getAll();
}

export async function getSettingByKey(
  key: string,
): Promise<ApiResult<Setting>> {
  return api.settings.getByKey(key);
}

export async function updateSetting(
  key: string,
  value: string,
): Promise<ApiResult<Setting>> {
  return api.settings.update(key, value);
}
