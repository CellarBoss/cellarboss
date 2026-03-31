import type { GenericType } from "./generic";

export interface Grape extends GenericType {}

export type CreateGrape = Omit<Grape, "id">;

export type UpdateGrape = Partial<Omit<Grape, "id">>;
