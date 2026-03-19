import type { Region } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function regionsResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Region[]>> =>
      request<Region[]>("region", "GET"),

    getById: (id: number): Promise<ApiResult<Region>> =>
      request<Region>("region/" + id, "GET"),

    create: (region: Region): Promise<ApiResult<Region>> =>
      request<Region>("region", "POST", JSON.stringify(region)),

    update: (region: Region): Promise<ApiResult<Region>> =>
      request<Region>("region/" + region.id, "PUT", JSON.stringify(region)),

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("region/" + id, "DELETE"),
  };
}
