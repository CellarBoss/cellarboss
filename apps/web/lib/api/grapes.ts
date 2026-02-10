"use client";

import type { Grape } from "@cellarboss/types";
import { ApiResult, makeRequest } from "./frontend";

export async function getGrapes(): Promise<ApiResult<Grape[]>> {
  return makeRequest<Grape[]>("/api/grapes/", "GET");
}

export async function deleteGrape(id: number): Promise<ApiResult<boolean>> {
  return makeRequest<boolean>("/api/grapes/" + id, "DELETE");
}

export async function getGrapeById(id: number): Promise<ApiResult<Grape>> {
  return makeRequest<Grape>("/api/grapes/" + id, "GET");
}

export async function updateGrape(grape: Grape): Promise<ApiResult<Grape>> {
  return makeRequest<Grape>("/api/grapes/" + grape.id, "PUT", JSON.stringify(grape));
}

export async function createGrape(grape: Grape): Promise<ApiResult<Grape>> {
  return makeRequest<Grape>("/api/grapes/", "POST", JSON.stringify(grape));
}