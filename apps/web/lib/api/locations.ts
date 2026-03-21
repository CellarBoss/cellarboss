"use server";

import type { Location } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getLocations(): Promise<ApiResult<Location[]>> {
  return api.locations.getAll();
}

export async function deleteLocation(id: number): Promise<ApiResult<boolean>> {
  return api.locations.delete(id);
}

export async function getLocationById(
  id: number,
): Promise<ApiResult<Location>> {
  return api.locations.getById(id);
}

export async function updateLocation(
  location: Location,
): Promise<ApiResult<Location>> {
  return api.locations.update(location);
}

export async function createLocation(
  location: Location,
): Promise<ApiResult<Location>> {
  return api.locations.create(location);
}
