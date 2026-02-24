"use server";

import type { Region } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getRegions(): Promise<ApiResult<Region[]>> {
  return makeServerRequest<Region[]>("region", "GET");
}

export async function deleteRegion(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("region/" + id, "DELETE");
}

export async function getRegionById(id: number): Promise<ApiResult<Region>> {
  return makeServerRequest<Region>("region/" + id, "GET");
}

export async function updateRegion(region: Region): Promise<ApiResult<Region>> {
  return makeServerRequest<Region>(
    "region/" + region.id,
    "PUT",
    JSON.stringify(region),
  );
}

export async function createRegion(region: Region): Promise<ApiResult<Region>> {
  return makeServerRequest<Region>("region", "POST", JSON.stringify(region));
}
