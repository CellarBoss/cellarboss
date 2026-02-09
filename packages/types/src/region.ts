export interface Region {
  id: number;
  name: string;
  countryId: number;
}

export type CreateRegion = Omit<Region, 'id'>;

export type UpdateRegion = Partial<Omit<Region, 'id'>>;