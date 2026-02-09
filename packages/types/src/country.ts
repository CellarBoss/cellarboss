export interface Country {
  id: number;
  name: string;
}

export type CreateCountry = Omit<Country, 'id'>;

export type UpdateCountry = Partial<Omit<Country, 'id'>>;