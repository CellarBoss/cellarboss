"use server";

import type { Country } from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getCountries(): Promise<ApiResult<Country[]>> {
  return makeServerRequest<Country[]>("country", "GET");
}

export async function deleteCountry(id: number): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("country/" + id, "DELETE");
}

export async function getCountryById(id: number): Promise<ApiResult<Country>> {
  return makeServerRequest<Country>("country/" + id, "GET");
}

export async function updateCountry(
  country: Country,
): Promise<ApiResult<Country>> {
  return makeServerRequest<Country>(
    "country/" + country.id,
    "PUT",
    JSON.stringify(country),
  );
}

export async function createCountry(
  country: Country,
): Promise<ApiResult<Country>> {
  return makeServerRequest<Country>("country", "POST", JSON.stringify(country));
}
