export interface Bottle {
  id: number;
  purchaseDate: string;
  purchasePrice: number;
  vintageId: number;
  storageId: number | null;
  status: "ordered" | "stored" | "in-primeur" | "drunk" | "sold" | "gifted";
  size:
    | "piccolo"
    | "half"
    | "standard"
    | "litre"
    | "magnum"
    | "double-magnum"
    | "jeroboam"
    | "imperial"
    | "salmanazar"
    | "balthazar"
    | "nebuchadnezzar";
}

export type CreateBottle = Omit<Bottle, "id">;

export type UpdateBottle = Partial<Omit<Bottle, "id">>;
