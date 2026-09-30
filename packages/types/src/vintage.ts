import type { BottleCounts } from "./bottle";

export interface Vintage {
  id: number;
  year: number | null;
  wineId: number;
  drinkFrom: number | null;
  drinkUntil: number | null;
}

export type CreateVintage = Omit<Vintage, "id">;

export type UpdateVintage = Partial<Omit<Vintage, "id">>;

// Read model returned by GET routes; create/update responses stay as Vintage
export interface VintageDetail extends Vintage {
  tastingNotesCount: number;
  bottles: BottleCounts;
}
