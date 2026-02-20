import type { GenericType } from "./generic.js";

export interface Wine extends GenericType {
  wineMakerId: number;
  regionId: number | null;
  type: 'red' | 'white' | 'rose' | 'orange' | 'sparkling' | 'fortified' | 'dessert';
}

export type CreateWine = Omit<Wine, 'id'>;

export type UpdateWine = Partial<Omit<Wine, 'id'>>;