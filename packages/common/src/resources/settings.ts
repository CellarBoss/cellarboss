import type { Setting } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function settingsResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Setting[]>> =>
      request<Setting[]>("settings", "GET"),

    getByKey: (key: string): Promise<ApiResult<Setting>> =>
      request<Setting>(`settings/${encodeURIComponent(key)}`, "GET"),

    update: (key: string, value: string): Promise<ApiResult<Setting>> =>
      request<Setting>(
        `settings/${encodeURIComponent(key)}`,
        "PUT",
        JSON.stringify({ value }),
      ),
  };
}
