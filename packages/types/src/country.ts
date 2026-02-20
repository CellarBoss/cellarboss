import type { GenericType } from "./generic.js";

export interface Country extends GenericType{

}

export type CreateCountry = Omit<Country, 'id'>;

export type UpdateCountry = Partial<Omit<Country, 'id'>>;