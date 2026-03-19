"use server";

import type { Country } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";
import { api } from "./client";

export async function getCountries(): Promise<ApiResult<Country[]>> {
  return api.countries.getAll();
}

export async function deleteCountry(id: number): Promise<ApiResult<boolean>> {
  return api.countries.delete(id);
}

export async function getCountryById(id: number): Promise<ApiResult<Country>> {
  return api.countries.getById(id);
}

export async function updateCountry(
  country: Country,
): Promise<ApiResult<Country>> {
  return api.countries.update(country);
}

export async function createCountry(
  country: Country,
): Promise<ApiResult<Country>> {
  return api.countries.create(country);
}
