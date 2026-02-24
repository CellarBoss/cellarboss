"use server";

import type { Grape } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getGrapes(): Promise<ApiResult<Grape[]>> {
  return makeServerRequest<Grape[]>("grape", "GET");
}

export async function deleteGrape(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("grape/" + id, "DELETE");
}

export async function getGrapeById(id: number): Promise<ApiResult<Grape>> {
  return makeServerRequest<Grape>("grape/" + id, "GET");
}

export async function updateGrape(grape: Grape): Promise<ApiResult<Grape>> {
  return makeServerRequest<Grape>(
    "grape/" + grape.id,
    "PUT",
    JSON.stringify(grape),
  );
}

export async function createGrape(grape: Grape): Promise<ApiResult<Grape>> {
  return makeServerRequest<Grape>("grape", "POST", JSON.stringify(grape));
}
