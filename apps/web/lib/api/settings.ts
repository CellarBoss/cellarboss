"use server";

import type { Setting } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getSettings(): Promise<ApiResult<Setting[]>> {
  return makeServerRequest<Setting[]>("settings", "GET");
}

export async function getSettingByKey(key: string): Promise<ApiResult<Setting>> {
  return makeServerRequest<Setting>(`settings/${encodeURIComponent(key)}`, "GET");
}

export async function updateSetting(
  key: string,
  value: string
): Promise<ApiResult<Setting>> {
  return makeServerRequest<Setting>(
    `settings/${encodeURIComponent(key)}`,
    "PUT",
    JSON.stringify({ value })
  );
}
