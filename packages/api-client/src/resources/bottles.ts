import type { Bottle, CreateBottle } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function bottlesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Bottle[]>> =>
      request<Bottle[]>("bottle", "GET"),

    getByVintageId: (vintageId: number): Promise<ApiResult<Bottle[]>> =>
      request<Bottle[]>("bottle/vintage/" + vintageId, "GET"),

    getCountsByVintageId: (
      vintageId: number,
    ): Promise<ApiResult<Array<{ status: string; count: number }>>> =>
      request<Array<{ status: string; count: number }>>(
        "bottle/vintage/" + vintageId + "/counts",
        "GET",
      ),

    getById: (id: number): Promise<ApiResult<Bottle>> =>
      request<Bottle>("bottle/" + id, "GET"),

    create: (bottle: CreateBottle): Promise<ApiResult<Bottle>> => {
      const body = {
        purchaseDate: bottle.purchaseDate,
        purchasePrice: Number(bottle.purchasePrice),
        vintageId: Number(bottle.vintageId),
        storageId: bottle.storageId ? Number(bottle.storageId) : null,
        status: bottle.status,
        size: bottle.size,
      };
      return request<Bottle>("bottle", "POST", JSON.stringify(body));
    },

    update: (bottle: Bottle): Promise<ApiResult<Bottle>> => {
      const body = {
        purchaseDate: bottle.purchaseDate,
        purchasePrice: Number(bottle.purchasePrice),
        vintageId: Number(bottle.vintageId),
        storageId: bottle.storageId ? Number(bottle.storageId) : null,
        status: bottle.status,
        size: bottle.size,
      };
      return request<Bottle>(
        "bottle/" + bottle.id,
        "PUT",
        JSON.stringify(body),
      );
    },

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("bottle/" + id, "DELETE"),
  };
}
