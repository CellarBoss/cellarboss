"use client";

import type { WineGrape, CreateWineGrape } from "@cellarboss/types";
import { ApiResult, makeRequest } from "./frontend";

export async function getWineGrapes(): Promise<ApiResult<WineGrape[]>> {
  return makeRequest<WineGrape[]>("/api/winegrapes", "GET");
}

export async function getWineGrapesByWineId(wineId: number): Promise<ApiResult<WineGrape[]>> {
  return makeRequest<WineGrape[]>("/api/winegrapes/wine/" + wineId, "GET");
}

export async function createWineGrape(data: CreateWineGrape): Promise<ApiResult<WineGrape>> {
  return makeRequest<WineGrape>("/api/winegrapes/", "POST", JSON.stringify(data));
}

export async function deleteWineGrape(id: number): Promise<ApiResult<boolean>> {
  return makeRequest<boolean>("/api/winegrapes/" + id, "DELETE");
}
