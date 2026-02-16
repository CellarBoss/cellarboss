"use server";

import type { WineGrape, CreateWineGrape } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getWineGrapes(): Promise<ApiResult<WineGrape[]>> {
  return makeServerRequest<WineGrape[]>("winegrape", "GET");
}

export async function getWineGrapesByWineId(wineId: number): Promise<ApiResult<WineGrape[]>> {
  return makeServerRequest<WineGrape[]>("winegrape/wine/" + wineId, "GET");
}

export async function createWineGrape(data: CreateWineGrape): Promise<ApiResult<WineGrape>> {
  return makeServerRequest<WineGrape>("winegrape", "POST", JSON.stringify(data));
}

export async function deleteWineGrape(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("winegrape/" + id, "DELETE");
}
