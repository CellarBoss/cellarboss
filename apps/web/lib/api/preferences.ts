"use server";

import type { Preference } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getPreferences(): Promise<ApiResult<Preference[]>> {
  return api.preferences.getAll();
}

export async function upsertPreference(
  key: string,
  value: string,
): Promise<ApiResult<Preference>> {
  return api.preferences.upsert(key, value);
}

export async function removePreference(
  key: string,
): Promise<ApiResult<{ success: boolean }>> {
  return api.preferences.remove(key);
}
