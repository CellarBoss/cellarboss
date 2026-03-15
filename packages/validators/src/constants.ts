export const BOTTLE_STATUSES = [
  "ordered",
  "stored",
  "in-primeur",
  "drunk",
  "sold",
  "gifted",
] as const;
export type BottleStatus = (typeof BOTTLE_STATUSES)[number];

export const BOTTLE_SIZES = [
  "piccolo",
  "half",
  "standard",
  "litre",
  "magnum",
  "double-magnum",
  "jeroboam",
  "imperial",
  "salmanazar",
  "balthazar",
  "nebuchadnezzar",
] as const;
export type BottleSize = (typeof BOTTLE_SIZES)[number];

export const WINE_TYPES = [
  "red",
  "white",
  "rose",
  "orange",
  "sparkling",
  "fortified",
  "dessert",
] as const;
export type WineType = (typeof WINE_TYPES)[number];
