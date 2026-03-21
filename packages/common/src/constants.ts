import type { BottleSize, WineType } from "@cellarboss/validators/constants";

export const WINE_TYPE_LABELS: Record<WineType, string> = {
  red: "Red",
  white: "White",
  rose: "Rosé",
  orange: "Orange",
  sparkling: "Sparkling",
  fortified: "Fortified",
  dessert: "Dessert",
};

export const BOTTLE_SIZE_LABELS: Record<BottleSize, string> = {
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

export const BOTTLE_SIZE_SHORT_LABELS: Record<BottleSize, string> = {
  piccolo: "187ml",
  half: "375ml",
  standard: "750ml",
  litre: "1L",
  magnum: "1.5L",
  "double-magnum": "3L",
  jeroboam: "4.5L",
  imperial: "6L",
  salmanazar: "9L",
  balthazar: "12L",
  nebuchadnezzar: "15L",
};
