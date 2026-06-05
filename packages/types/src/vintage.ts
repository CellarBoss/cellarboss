export interface Vintage {
  id: number;
  year: number | null;
  wineId: number;
  drinkFrom: number | null;
  drinkUntil: number | null;
  notes: string | null;
}

export type CreateVintage = {
  year: Vintage["year"];
  wineId: Vintage["wineId"];
  drinkFrom: Vintage["drinkFrom"];
  drinkUntil: Vintage["drinkUntil"];
  notes?: Vintage["notes"];
};

export type UpdateVintage = Partial<CreateVintage>;
