export interface Location {
  id: number;
  name: string;
}

export type CreateLocation = Omit<Location, 'id'>;

export type UpdateLocation = Partial<Omit<Location, 'id'>>;