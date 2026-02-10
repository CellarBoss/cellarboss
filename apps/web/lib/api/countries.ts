"use client";

import type { Country } from "@cellarboss/types";
import { ApiResult, makeRequest } from "./frontend";

export async function getCountries(): Promise<ApiResult<Country[]>> {
  return makeRequest<Country[]>("/api/countries", "GET");
}

export async function deleteCountry(id: number): Promise<ApiResult<boolean>> {
  return makeRequest<boolean>("/api/countries/" + id, "DELETE");
}

export async function getCountryById(id: number): Promise<ApiResult<Country>> {
  return makeRequest<Country>("/api/countries/" + id, "GET");
}

export async function updateCountry(country: Country): Promise<ApiResult<Country>> {
  return makeRequest<Country>("/api/countries/" + country.id, "PUT", JSON.stringify(country));
}

export async function createCountry(country: Country): Promise<ApiResult<Country>> {
  return makeRequest<Country>("/api/countries/", "POST", JSON.stringify(country));
}