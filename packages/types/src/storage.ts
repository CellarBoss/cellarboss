import { GenericType } from "./generic.js";

export interface Storage extends GenericType {
  locationId: number | null;
  parent: number | null;
}

export type CreateStorage = Omit<Storage, 'id'>;

export type UpdateStorage = Partial<Omit<Storage, 'id'>>;