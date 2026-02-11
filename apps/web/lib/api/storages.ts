"use client";

import type { Storage } from "@cellarboss/types";
import { ApiResult, makeRequest } from "./frontend";

export async function getStorages(): Promise<ApiResult<Storage[]>> {
  return makeRequest<Storage[]>("/api/storages", "GET");
}

export async function deleteStorage(id: number): Promise<ApiResult<boolean>> {
  return makeRequest<boolean>("/api/storages/" + id, "DELETE");
}

export async function getStorageById(id: number): Promise<ApiResult<Storage>> {
  return makeRequest<Storage>("/api/storages/" + id, "GET");
}

export async function updateStorage(storage: Storage): Promise<ApiResult<Storage>> {
  const body = {
    ...storage,
    locationId: storage.locationId ? Number(storage.locationId) : null,
    parent: storage.parent ? Number(storage.parent) : null,
  };
  return makeRequest<Storage>("/api/storages/" + storage.id, "PUT", JSON.stringify(body));
}

export async function createStorage(storage: Storage): Promise<ApiResult<Storage>> {
  const body = {
    ...storage,
    locationId: storage.locationId ? Number(storage.locationId) : null,
    parent: storage.parent ? Number(storage.parent) : null,
  };
  return makeRequest<Storage>("/api/storages/", "POST", JSON.stringify(body));
}
