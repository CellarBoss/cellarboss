"use server";

import type { Grape } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";
import { api } from "./client";

export async function getGrapes(): Promise<ApiResult<Grape[]>> {
  return api.grapes.getAll();
}

export async function deleteGrape(id: number): Promise<ApiResult<boolean>> {
  return api.grapes.delete(id);
}

export async function getGrapeById(id: number): Promise<ApiResult<Grape>> {
  return api.grapes.getById(id);
}

export async function updateGrape(grape: Grape): Promise<ApiResult<Grape>> {
  return api.grapes.update(grape);
}

export async function createGrape(grape: Grape): Promise<ApiResult<Grape>> {
  return api.grapes.create(grape);
}
