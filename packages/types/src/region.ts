import type { GenericType } from "./generic.js";

export interface Region extends GenericType {
  countryId: number;
}

export type CreateRegion = Omit<Region, 'id'>;

export type UpdateRegion = Partial<Omit<Region, 'id'>>;