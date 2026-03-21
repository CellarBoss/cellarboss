import type { WineType } from "@cellarboss/validators/constants";

export const WINE_TYPE_LABELS: Record<WineType, string> = {
  red: "Red",
  white: "White",
  rose: "Rosé",
  orange: "Orange",
  sparkling: "Sparkling",
  fortified: "Fortified",
  dessert: "Dessert",
};

export const BOTTLE_SIZE_LABELS: Record<string, string> = {
  piccolo: "Piccolo (187ml)",
  half: "Half (375ml)",
  standard: "Standard (750ml)",
  litre: "Litre (1L)",
  magnum: "Magnum (1.5L)",
  "double-magnum": "Double Magnum (3L)",
  jeroboam: "Jeroboam (4.5L)",
  imperial: "Imperial (6L)",
  salmanazar: "Salmanazar (9L)",
  balthazar: "Balthazar (12L)",
  nebuchadnezzar: "Nebuchadnezzar (15L)",
};
