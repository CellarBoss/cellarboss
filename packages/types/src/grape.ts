import type { GenericType } from "./generic";

export type Grape = GenericType;

export type CreateGrape = Omit<Grape, "id">;

export type UpdateGrape = Partial<Omit<Grape, "id">>;
