import { GenericType } from "./generic.js";

export interface Location extends GenericType {

}

export type CreateLocation = Omit<Location, 'id'>;

export type UpdateLocation = Partial<Omit<Location, 'id'>>;