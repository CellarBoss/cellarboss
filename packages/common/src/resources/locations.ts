import type { Location } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function locationsResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Location[]>> =>
      request<Location[]>("location", "GET"),

    getById: (id: number): Promise<ApiResult<Location>> =>
      request<Location>("location/" + id, "GET"),

    create: (location: Location): Promise<ApiResult<Location>> =>
      request<Location>("location", "POST", JSON.stringify(location)),

    update: (location: Location): Promise<ApiResult<Location>> =>
      request<Location>(
        "location/" + location.id,
        "PUT",
        JSON.stringify(location),
      ),

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("location/" + id, "DELETE"),
  };
}
