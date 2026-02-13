"use client";

import type { Wine } from "@cellarboss/types";
import { ApiResult, makeRequest } from "./frontend";

export async function getWines(): Promise<ApiResult<Wine[]>> {
  return makeRequest<Wine[]>("/api/wines", "GET");
}

export async function deleteWine(id: number): Promise<ApiResult<boolean>> {
  return makeRequest<boolean>("/api/wines/" + id, "DELETE");
}

export async function getWineById(id: number): Promise<ApiResult<Wine>> {
  return makeRequest<Wine>("/api/wines/" + id, "GET");
}

export async function updateWine(wine: Wine): Promise<ApiResult<Wine>> {
  const body = {
    ...wine,
    wineMakerId: Number(wine.wineMakerId),
    regionId: wine.regionId ? Number(wine.regionId) : null,
  };
  return makeRequest<Wine>("/api/wines/" + wine.id, "PUT", JSON.stringify(body));
}

export async function createWine(wine: Wine): Promise<ApiResult<Wine>> {
  const body = {
    ...wine,
    wineMakerId: Number(wine.wineMakerId),
    regionId: wine.regionId ? Number(wine.regionId) : null,
  };
  return makeRequest<Wine>("/api/wines/", "POST", JSON.stringify(body));
}
