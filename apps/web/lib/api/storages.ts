"use server";

import type { Storage } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getStorages(): Promise<ApiResult<Storage[]>> {
  return makeServerRequest<Storage[]>("storage", "GET");
}

export async function deleteStorage(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("storage/" + id, "DELETE");
}

export async function getStorageById(id: number): Promise<ApiResult<Storage>> {
  return makeServerRequest<Storage>("storage/" + id, "GET");
}

export async function updateStorage(
  storage: Storage,
): Promise<ApiResult<Storage>> {
  const body = {
    ...storage,
    locationId: storage.locationId ? Number(storage.locationId) : null,
    parent: storage.parent ? Number(storage.parent) : null,
  };
  return makeServerRequest<Storage>(
    "storage/" + storage.id,
    "PUT",
    JSON.stringify(body),
  );
}

export async function createStorage(
  storage: Storage,
): Promise<ApiResult<Storage>> {
  const body = {
    ...storage,
    locationId: storage.locationId ? Number(storage.locationId) : null,
    parent: storage.parent ? Number(storage.parent) : null,
  };
  return makeServerRequest<Storage>("storage", "POST", JSON.stringify(body));
}
