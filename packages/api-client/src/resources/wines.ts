import type { Wine } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function winesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Wine[]>> => request<Wine[]>("wine", "GET"),

    getById: (id: number): Promise<ApiResult<Wine>> =>
      request<Wine>("wine/" + id, "GET"),

    create: (wine: Wine): Promise<ApiResult<Wine>> => {
      const body = {
        ...wine,
        wineMakerId: Number(wine.wineMakerId),
        regionId: wine.regionId ? Number(wine.regionId) : null,
      };
      return request<Wine>("wine", "POST", JSON.stringify(body));
    },

    update: (wine: Wine): Promise<ApiResult<Wine>> => {
      const body = {
        ...wine,
        wineMakerId: Number(wine.wineMakerId),
        regionId: wine.regionId ? Number(wine.regionId) : null,
      };
      return request<Wine>("wine/" + wine.id, "PUT", JSON.stringify(body));
    },

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("wine/" + id, "DELETE"),
  };
}
