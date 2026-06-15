import type { Preference } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function preferencesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Preference[]>> =>
      request<Preference[]>("user/preferences", "GET"),

    getByKey: (key: string): Promise<ApiResult<Preference>> =>
      request<Preference>(`user/preferences/${encodeURIComponent(key)}`, "GET"),

    upsert: (key: string, value: string): Promise<ApiResult<Preference>> =>
      request<Preference>(
        `user/preferences/${encodeURIComponent(key)}`,
        "PUT",
        JSON.stringify({ value }),
      ),

    remove: (key: string): Promise<ApiResult<{ success: boolean }>> =>
      request<{ success: boolean }>(
        `user/preferences/${encodeURIComponent(key)}`,
        "DELETE",
      ),
  };
}
