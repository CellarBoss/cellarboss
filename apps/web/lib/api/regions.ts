"use client";

import type { Region } from "@cellarboss/types";
import { ApiResult, makeRequest } from "./frontend";

export async function getRegions(): Promise<ApiResult<Region[]>> {
  return makeRequest<Region[]>("/api/regions", "GET");
}

export async function deleteRegion(id: number): Promise<ApiResult<boolean>> {
  return makeRequest<boolean>("/api/regions/" + id, "DELETE");
}

export async function getRegionById(id: number): Promise<ApiResult<Region>> {
  return makeRequest<Region>("/api/regions/" + id, "GET");
}

export async function updateRegion(region: Region): Promise<ApiResult<Region>> {
  return makeRequest<Region>("/api/regions/" + region.id, "PUT", JSON.stringify(region));
}

export async function createRegion(region: Region): Promise<ApiResult<Region>> {
  return makeRequest<Region>("/api/regions/", "POST", JSON.stringify(region));
}