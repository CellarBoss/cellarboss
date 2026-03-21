import type { Storage } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function storagesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<Storage[]>> =>
      request<Storage[]>("storage", "GET"),

    getById: (id: number): Promise<ApiResult<Storage>> =>
      request<Storage>("storage/" + id, "GET"),

    create: (storage: Storage): Promise<ApiResult<Storage>> => {
      const body = {
        ...storage,
        locationId: storage.locationId ? Number(storage.locationId) : null,
        parent: storage.parent ? Number(storage.parent) : null,
      };
      return request<Storage>("storage", "POST", JSON.stringify(body));
    },

    update: (storage: Storage): Promise<ApiResult<Storage>> => {
      const body = {
        ...storage,
        locationId: storage.locationId ? Number(storage.locationId) : null,
        parent: storage.parent ? Number(storage.parent) : null,
      };
      return request<Storage>(
        "storage/" + storage.id,
        "PUT",
        JSON.stringify(body),
      );
    },

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("storage/" + id, "DELETE"),
  };
}
