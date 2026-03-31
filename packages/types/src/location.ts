import type { GenericType } from "./generic";

export interface Location extends GenericType {}

export type CreateLocation = Omit<Location, "id">;

export type UpdateLocation = Partial<Omit<Location, "id">>;
