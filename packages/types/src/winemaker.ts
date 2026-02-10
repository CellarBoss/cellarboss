import { GenericType } from "./generic.js";

export interface WineMaker extends GenericType {
  id: number;
  name: string;
}

export type CreateWineMaker = Omit<WineMaker, 'id'>;

export type UpdateWineMaker = Partial<Omit<WineMaker, 'id'>>;