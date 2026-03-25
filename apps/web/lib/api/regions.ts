"use server";

import type { Region } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getRegions(): Promise<ApiResult<Region[]>> {
  return api.regions.getAll();
}

export async function deleteRegion(id: number): Promise<ApiResult<boolean>> {
  return api.regions.delete(id);
}

export async function getRegionById(id: number): Promise<ApiResult<Region>> {
  return api.regions.getById(id);
}

export async function updateRegion(region: Region): Promise<ApiResult<Region>> {
  return api.regions.update(region);
}

export async function createRegion(region: Region): Promise<ApiResult<Region>> {
  return api.regions.create(region);
}
