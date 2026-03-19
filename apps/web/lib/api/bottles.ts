"use server";

import type { Bottle, CreateBottle } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";
import { api } from "./client";

export async function getBottles(): Promise<ApiResult<Bottle[]>> {
  return api.bottles.getAll();
}

export async function getBottlesByVintageId(
  vintageId: number,
): Promise<ApiResult<Bottle[]>> {
  return api.bottles.getByVintageId(vintageId);
}

export async function getBottleCountsByVintageId(
  vintageId: number,
): Promise<ApiResult<Array<{ status: string; count: number }>>> {
  return api.bottles.getCountsByVintageId(vintageId);
}

export async function getBottleById(id: number): Promise<ApiResult<Bottle>> {
  return api.bottles.getById(id);
}

export async function deleteBottle(id: number): Promise<ApiResult<boolean>> {
  return api.bottles.delete(id);
}

export async function createBottle(
  bottle: CreateBottle,
): Promise<ApiResult<Bottle>> {
  return api.bottles.create(bottle);
}

export async function updateBottle(bottle: Bottle): Promise<ApiResult<Bottle>> {
  return api.bottles.update(bottle);
}
