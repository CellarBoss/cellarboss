"use server";

import type { WineGrape, CreateWineGrape } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getWineGrapes(): Promise<ApiResult<WineGrape[]>> {
  return api.winegrapes.getAll();
}

export async function getWineGrapesByWineId(
  wineId: number,
): Promise<ApiResult<WineGrape[]>> {
  return api.winegrapes.getByWineId(wineId);
}

export async function createWineGrape(
  data: CreateWineGrape,
): Promise<ApiResult<WineGrape>> {
  return api.winegrapes.create(data);
}

export async function deleteWineGrape(id: number): Promise<ApiResult<boolean>> {
  return api.winegrapes.delete(id);
}
