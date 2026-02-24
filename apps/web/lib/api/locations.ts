"use server";

import type { Location } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getLocations(): Promise<ApiResult<Location[]>> {
  return makeServerRequest<Location[]>("location", "GET");
}

export async function deleteLocation(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("location/" + id, "DELETE");
}

export async function getLocationById(
  id: number,
): Promise<ApiResult<Location>> {
  return makeServerRequest<Location>("location/" + id, "GET");
}

export async function updateLocation(
  location: Location,
): Promise<ApiResult<Location>> {
  return makeServerRequest<Location>(
    "location/" + location.id,
    "PUT",
    JSON.stringify(location),
  );
}

export async function createLocation(
  location: Location,
): Promise<ApiResult<Location>> {
  return makeServerRequest<Location>(
    "location",
    "POST",
    JSON.stringify(location),
  );
}
