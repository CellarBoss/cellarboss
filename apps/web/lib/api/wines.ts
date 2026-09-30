"use server";

import type { Wine, WineDetail } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getWines(): Promise<ApiResult<WineDetail[]>> {
  return api.wines.getAll();
}

export async function deleteWine(id: number): Promise<ApiResult<boolean>> {
  return api.wines.delete(id);
}

export async function getWineById(id: number): Promise<ApiResult<WineDetail>> {
  return api.wines.getById(id);
}

export async function updateWine(wine: Wine): Promise<ApiResult<Wine>> {
  return api.wines.update(wine);
}

export async function createWine(wine: Wine): Promise<ApiResult<Wine>> {
  return api.wines.create(wine);
}
