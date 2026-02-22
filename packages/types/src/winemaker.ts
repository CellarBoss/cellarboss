import type { GenericType } from "./generic.js";

export interface WineMaker extends GenericType {}

export type CreateWineMaker = Omit<WineMaker, 'id'>;

export type UpdateWineMaker = Partial<Omit<WineMaker, 'id'>>;