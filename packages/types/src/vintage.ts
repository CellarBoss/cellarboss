export interface Vintage {
  id: number;
  year: number | null;
  wineId: number;
  drinkFrom: number | null;
  drinkUntil: number | null;
  notes: string;
}

export type CreateVintage = Omit<Vintage, "id">;

export type UpdateVintage = Partial<Omit<Vintage, "id">>;
