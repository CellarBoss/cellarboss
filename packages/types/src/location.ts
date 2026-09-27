import type { GenericType } from "./generic";

export type Location = GenericType;

export type CreateLocation = Omit<Location, "id">;

export type UpdateLocation = Partial<Omit<Location, "id">>;
