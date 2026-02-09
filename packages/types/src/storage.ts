export interface Storage {
  id: number;
  name: string;
  locationId: number | null;
  parent: number | null;
}

export type CreateStorage = Omit<Storage, 'id'>;

export type UpdateStorage = Partial<Omit<Storage, 'id'>>;