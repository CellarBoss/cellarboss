"use server";

import type { WineMaker } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getWinemakers(): Promise<ApiResult<WineMaker[]>> {
  return makeServerRequest<WineMaker[]>("winemaker", "GET");
}

export async function deleteWinemaker(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("winemaker/" + id, "DELETE");
}

export async function getWinemakerById(id: number): Promise<ApiResult<WineMaker>> {
  return makeServerRequest<WineMaker>("winemaker/" + id, "GET");
}

export async function updateWinemaker(winemaker: WineMaker): Promise<ApiResult<WineMaker>> {
  return makeServerRequest<WineMaker>("winemaker/" + winemaker.id, "PUT", JSON.stringify(winemaker));
}

export async function createWinemaker(winemaker: WineMaker): Promise<ApiResult<WineMaker>> {
  return makeServerRequest<WineMaker>("winemaker", "POST", JSON.stringify(winemaker));
}
