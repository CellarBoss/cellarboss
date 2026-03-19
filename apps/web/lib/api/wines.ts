"use server";

import type { Wine } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";
import { api } from "./client";

export async function getWines(): Promise<ApiResult<Wine[]>> {
  return api.wines.getAll();
}

export async function deleteWine(id: number): Promise<ApiResult<boolean>> {
  return api.wines.delete(id);
}

export async function getWineById(id: number): Promise<ApiResult<Wine>> {
  return api.wines.getById(id);
}

export async function updateWine(wine: Wine): Promise<ApiResult<Wine>> {
  return api.wines.update(wine);
}

export async function createWine(wine: Wine): Promise<ApiResult<Wine>> {
  return api.wines.create(wine);
}
