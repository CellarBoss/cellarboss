import type { JsonValue, UserPreference } from "@cellarboss/types";
import { api } from "./client";
import type { ApiResult } from "./types";

export async function getPreference<TValue extends JsonValue = JsonValue>(
  key: string,
): Promise<ApiResult<UserPreference<TValue> | null>> {
  const result = await api.preferences.get<TValue>(key);
  if (!result.ok && result.error.status === 404) {
    return { ok: true, data: null };
  }
  return result;
}

export function updatePreference<TValue extends JsonValue = JsonValue>(
  key: string,
  value: TValue,
): Promise<ApiResult<UserPreference<TValue>>> {
  return api.preferences.update(key, value);
}

export function deletePreference(key: string): Promise<ApiResult<boolean>> {
  return api.preferences.delete(key);
}
