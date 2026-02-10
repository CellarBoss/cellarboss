"use client";

import type { WineMaker } from "@cellarboss/types";
import { ApiResult, makeRequest } from "./frontend";

export async function getWinemakers(): Promise<ApiResult<WineMaker[]>> {
  return makeRequest<WineMaker[]>("/api/winemakers", "GET");
}

export async function deleteWinemaker(id: number): Promise<ApiResult<boolean>> {
  return makeRequest<boolean>("/api/winemakers/" + id, "DELETE");
}

export async function getWinemakerById(id: number): Promise<ApiResult<WineMaker>> {
  return makeRequest<WineMaker>("/api/winemakers/" + id, "GET");
}

export async function updateWinemaker(winemaker: WineMaker): Promise<ApiResult<WineMaker>> {
  return makeRequest<WineMaker>("/api/winemakers/" + winemaker.id, "PUT", JSON.stringify(winemaker));
}

export async function createWinemaker(winemaker: WineMaker): Promise<ApiResult<WineMaker>> {
  return makeRequest<WineMaker>("/api/winemakers/", "POST", JSON.stringify(winemaker));
}
