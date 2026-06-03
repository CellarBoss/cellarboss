import type { Wine, WineWithCounts } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function winesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<WineWithCounts[]>> =>
      request<WineWithCounts[]>("wine", "GET"),

    getById: (id: number): Promise<ApiResult<WineWithCounts>> =>
      request<WineWithCounts>("wine/" + id, "GET"),

    create: (wine: Wine): Promise<ApiResult<WineWithCounts>> => {
      const body = {
        ...wine,
        wineMakerId: Number(wine.wineMakerId),
        regionId: wine.regionId ? Number(wine.regionId) : null,
      };
      return request<WineWithCounts>("wine", "POST", JSON.stringify(body));
    },

    update: (wine: Wine): Promise<ApiResult<WineWithCounts>> => {
      const body = {
        ...wine,
        wineMakerId: Number(wine.wineMakerId),
        regionId: wine.regionId ? Number(wine.regionId) : null,
      };
      return request<WineWithCounts>(
        "wine/" + wine.id,
        "PUT",
        JSON.stringify(body),
      );
    },

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("wine/" + id, "DELETE"),
  };
}
