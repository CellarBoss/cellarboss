import type {
  JsonValue,
  UpsertUserPreference,
  UserPreference,
} from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function preferencesResource(request: RequestFn) {
  return {
    get: <TValue extends JsonValue = JsonValue>(
      key: string,
    ): Promise<ApiResult<UserPreference<TValue>>> =>
      request<UserPreference<TValue>>(
        `preferences/${encodeURIComponent(key)}`,
        "GET",
      ),

    update: <TValue extends JsonValue = JsonValue>(
      key: string,
      value: TValue,
    ): Promise<ApiResult<UserPreference<TValue>>> => {
      const body: UpsertUserPreference<TValue> = { value };
      return request<UserPreference<TValue>>(
        `preferences/${encodeURIComponent(key)}`,
        "PUT",
        JSON.stringify(body),
      );
    },

    delete: (key: string): Promise<ApiResult<boolean>> =>
      request<{ success: boolean }>(
        `preferences/${encodeURIComponent(key)}`,
        "DELETE",
      ).then((result) => {
        if (!result.ok) return result;
        return { ok: true, data: result.data.success };
      }),
  };
}
