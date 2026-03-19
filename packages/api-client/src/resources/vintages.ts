import type { Vintage, CreateVintage } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function vintagesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Vintage[]>> =>
      request<Vintage[]>("vintage", "GET"),

    getByWineId: (wineId: number): Promise<ApiResult<Vintage[]>> =>
      request<Vintage[]>("vintage/wine/" + wineId, "GET"),

    getById: (id: number): Promise<ApiResult<Vintage>> =>
      request<Vintage>("vintage/" + id, "GET"),

    create: (vintage: CreateVintage): Promise<ApiResult<Vintage>> => {
      const body = {
        year: vintage.year ? Number(vintage.year) : null,
        wineId: Number(vintage.wineId),
        drinkFrom: vintage.drinkFrom ? Number(vintage.drinkFrom) : null,
        drinkUntil: vintage.drinkUntil ? Number(vintage.drinkUntil) : null,
      };
      return request<Vintage>("vintage", "POST", JSON.stringify(body));
    },

    update: (vintage: Vintage): Promise<ApiResult<Vintage>> => {
      const body = {
        year: vintage.year ? Number(vintage.year) : null,
        wineId: Number(vintage.wineId),
        drinkFrom: vintage.drinkFrom ? Number(vintage.drinkFrom) : null,
        drinkUntil: vintage.drinkUntil ? Number(vintage.drinkUntil) : null,
      };
      return request<Vintage>(
        "vintage/" + vintage.id,
        "PUT",
        JSON.stringify(body),
      );
    },

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("vintage/" + id, "DELETE"),
  };
}
