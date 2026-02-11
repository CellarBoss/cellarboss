"use client";

import type { Location } from "@cellarboss/types";
import { ApiResult, makeRequest } from "./frontend";

export async function getLocations(): Promise<ApiResult<Location[]>> {
  return makeRequest<Location[]>("/api/locations", "GET");
}

export async function deleteLocation(id: number): Promise<ApiResult<boolean>> {
  return makeRequest<boolean>("/api/locations/" + id, "DELETE");
}

export async function getLocationById(id: number): Promise<ApiResult<Location>> {
  return makeRequest<Location>("/api/locations/" + id, "GET");
}

export async function updateLocation(location: Location): Promise<ApiResult<Location>> {
  return makeRequest<Location>("/api/locations/" + location.id, "PUT", JSON.stringify(location));
}

export async function createLocation(location: Location): Promise<ApiResult<Location>> {
  return makeRequest<Location>("/api/locations/", "POST", JSON.stringify(location));
}
