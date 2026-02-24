"use server";

import type { Vintage, CreateVintage } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getVintages(): Promise<ApiResult<Vintage[]>> {
  return makeServerRequest<Vintage[]>("vintage", "GET");
}

export async function getVintagesByWineId(
  wineId: number,
): Promise<ApiResult<Vintage[]>> {
  return makeServerRequest<Vintage[]>("vintage/wine/" + wineId, "GET");
}

export async function deleteVintage(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("vintage/" + id, "DELETE");
}

export async function getVintageById(id: number): Promise<ApiResult<Vintage>> {
  return makeServerRequest<Vintage>("vintage/" + id, "GET");
}

export async function updateVintage(
  vintage: Vintage,
): Promise<ApiResult<Vintage>> {
  const body = {
    year: vintage.year ? Number(vintage.year) : null,
    wineId: Number(vintage.wineId),
    drinkFrom: vintage.drinkFrom ? Number(vintage.drinkFrom) : null,
    drinkUntil: vintage.drinkUntil ? Number(vintage.drinkUntil) : null,
  };
  return makeServerRequest<Vintage>(
    "vintage/" + vintage.id,
    "PUT",
    JSON.stringify(body),
  );
}

export async function createVintage(
  vintage: CreateVintage,
): Promise<ApiResult<Vintage>> {
  const body = {
    year: vintage.year ? Number(vintage.year) : null,
    wineId: Number(vintage.wineId),
    drinkFrom: vintage.drinkFrom ? Number(vintage.drinkFrom) : null,
    drinkUntil: vintage.drinkUntil ? Number(vintage.drinkUntil) : null,
  };
  return makeServerRequest<Vintage>("vintage", "POST", JSON.stringify(body));
}
