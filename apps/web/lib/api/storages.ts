"use server";

import type { Storage } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";
import { api } from "./client";

export async function getStorages(): Promise<ApiResult<Storage[]>> {
  return api.storages.getAll();
}

export async function deleteStorage(id: number): Promise<ApiResult<boolean>> {
  return api.storages.delete(id);
}

export async function getStorageById(id: number): Promise<ApiResult<Storage>> {
  return api.storages.getById(id);
}

export async function updateStorage(
  storage: Storage,
): Promise<ApiResult<Storage>> {
  return api.storages.update(storage);
}

export async function createStorage(
  storage: Storage,
): Promise<ApiResult<Storage>> {
  return api.storages.create(storage);
}
