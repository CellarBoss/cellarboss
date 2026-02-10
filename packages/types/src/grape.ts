import { GenericType } from "./generic.js";

export interface Grape extends GenericType {

}

export type CreateGrape = Omit<Grape, 'id'>;

export type UpdateGrape = Partial<Omit<Grape, 'id'>>;