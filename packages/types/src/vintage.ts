export interface Vintage {
  id: number;
  year: number | null;
  wineId: number;
  drinkFrom: number | null;
  drinkUntil: number | null;
  notes: string | null;
}

export type CreateVintage = Omit<Vintage, "id" | "notes"> & {
  notes?: Vintage["notes"];
};

export type UpdateVintage = Partial<Omit<Vintage, "id">>;
