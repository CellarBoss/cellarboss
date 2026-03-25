import type { WineGrape, CreateWineGrape } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function winegrapesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<WineGrape[]>> =>
      request<WineGrape[]>("winegrape", "GET"),

    getByWineId: (wineId: number): Promise<ApiResult<WineGrape[]>> =>
      request<WineGrape[]>("winegrape/wine/" + wineId, "GET"),

    create: (data: CreateWineGrape): Promise<ApiResult<WineGrape>> =>
      request<WineGrape>("winegrape", "POST", JSON.stringify(data)),

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("winegrape/" + id, "DELETE"),
  };
}
