import type { GenericType } from "./generic";

export type WineMaker = GenericType;

export type CreateWineMaker = Omit<WineMaker, "id">;

export type UpdateWineMaker = Partial<Omit<WineMaker, "id">>;
