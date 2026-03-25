"use server";

import type { WineMaker } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getWinemakers(): Promise<ApiResult<WineMaker[]>> {
  return api.winemakers.getAll();
}

export async function deleteWinemaker(id: number): Promise<ApiResult<boolean>> {
  return api.winemakers.delete(id);
}

export async function getWinemakerById(
  id: number,
): Promise<ApiResult<WineMaker>> {
  return api.winemakers.getById(id);
}

export async function updateWinemaker(
  winemaker: WineMaker,
): Promise<ApiResult<WineMaker>> {
  return api.winemakers.update(winemaker);
}

export async function createWinemaker(
  winemaker: WineMaker,
): Promise<ApiResult<WineMaker>> {
  return api.winemakers.create(winemaker);
}
