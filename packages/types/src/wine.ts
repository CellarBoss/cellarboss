import { GenericType } from "./generic.js";

export interface Wine extends GenericType {
  wineMakerId: number;
  regionId: number | null;
}

export type CreateWine = Omit<Wine, 'id'>;

export type UpdateWine = Partial<Omit<Wine, 'id'>>;