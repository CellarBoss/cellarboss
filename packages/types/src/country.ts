import type { GenericType } from "./generic";

export type Country = GenericType;

export type CreateCountry = Omit<Country, "id">;

export type UpdateCountry = Partial<Omit<Country, "id">>;
