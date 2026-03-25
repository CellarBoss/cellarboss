"use server";

import type { Vintage, CreateVintage } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getVintages(): Promise<ApiResult<Vintage[]>> {
  return api.vintages.getAll();
}

export async function getVintagesByWineId(
  wineId: number,
): Promise<ApiResult<Vintage[]>> {
  return api.vintages.getByWineId(wineId);
}

export async function deleteVintage(id: number): Promise<ApiResult<boolean>> {
  return api.vintages.delete(id);
}

export async function getVintageById(id: number): Promise<ApiResult<Vintage>> {
  return api.vintages.getById(id);
}

export async function updateVintage(
  vintage: Vintage,
): Promise<ApiResult<Vintage>> {
  return api.vintages.update(vintage);
}

export async function createVintage(
  vintage: CreateVintage,
): Promise<ApiResult<Vintage>> {
  return api.vintages.create(vintage);
}
