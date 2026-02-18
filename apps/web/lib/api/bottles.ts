"use server";

import type { Bottle, CreateBottle } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getBottles(): Promise<ApiResult<Bottle[]>> {
  return makeServerRequest<Bottle[]>("bottle", "GET");
}

export async function getBottleById(id: number): Promise<ApiResult<Bottle>> {
  return makeServerRequest<Bottle>("bottle/" + id, "GET");
}

export async function deleteBottle(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("bottle/" + id, "DELETE");
}

export async function createBottle(bottle: CreateBottle): Promise<ApiResult<Bottle>> {
  const body = {
    purchaseDate: bottle.purchaseDate,
    purchasePrice: Number(bottle.purchasePrice),
    vintageId: Number(bottle.vintageId),
    storageId: bottle.storageId ? Number(bottle.storageId) : null,
    status: bottle.status,
  };
  return makeServerRequest<Bottle>("bottle", "POST", JSON.stringify(body));
}

export async function updateBottle(bottle: Bottle): Promise<ApiResult<Bottle>> {
  const body = {
    purchaseDate: bottle.purchaseDate,
    purchasePrice: Number(bottle.purchasePrice),
    vintageId: Number(bottle.vintageId),
    storageId: bottle.storageId ? Number(bottle.storageId) : null,
    status: bottle.status,
  };
  return makeServerRequest<Bottle>("bottle/" + bottle.id, "PUT", JSON.stringify(body));
}
