import type { Country } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function countriesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Country[]>> =>
      request<Country[]>("country", "GET"),

    getById: (id: number): Promise<ApiResult<Country>> =>
      request<Country>("country/" + id, "GET"),

    create: (country: Country): Promise<ApiResult<Country>> =>
      request<Country>("country", "POST", JSON.stringify(country)),

    update: (country: Country): Promise<ApiResult<Country>> =>
      request<Country>("country/" + country.id, "PUT", JSON.stringify(country)),

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("country/" + id, "DELETE"),
  };
}
