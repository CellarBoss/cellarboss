export interface Grape {
  id: number;
  name: string;
}

export type CreateGrape = Omit<Grape, 'id'>;

export type UpdateGrape = Partial<Omit<Grape, 'id'>>;