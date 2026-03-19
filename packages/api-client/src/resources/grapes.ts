import type { Grape } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function grapesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Grape[]>> => request<Grape[]>("grape", "GET"),

    getById: (id: number): Promise<ApiResult<Grape>> =>
      request<Grape>("grape/" + id, "GET"),

    create: (grape: Grape): Promise<ApiResult<Grape>> =>
      request<Grape>("grape", "POST", JSON.stringify(grape)),

    update: (grape: Grape): Promise<ApiResult<Grape>> =>
      request<Grape>("grape/" + grape.id, "PUT", JSON.stringify(grape)),

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("grape/" + id, "DELETE"),
  };
}
