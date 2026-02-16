"use server";

import type { Wine } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getWines(): Promise<ApiResult<Wine[]>> {
  return makeServerRequest<Wine[]>("wine", "GET");
}

export async function deleteWine(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("wine/" + id, "DELETE");
}

export async function getWineById(id: number): Promise<ApiResult<Wine>> {
  return makeServerRequest<Wine>("wine/" + id, "GET");
}

export async function updateWine(wine: Wine): Promise<ApiResult<Wine>> {
  const body = {
    ...wine,
    wineMakerId: Number(wine.wineMakerId),
    regionId: wine.regionId ? Number(wine.regionId) : null,
  };
  return makeServerRequest<Wine>("wine/" + wine.id, "PUT", JSON.stringify(body));
}

export async function createWine(wine: Wine): Promise<ApiResult<Wine>> {
  const body = {
    ...wine,
    wineMakerId: Number(wine.wineMakerId),
    regionId: wine.regionId ? Number(wine.regionId) : null,
  };
  return makeServerRequest<Wine>("wine", "POST", JSON.stringify(body));
}
