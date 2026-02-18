import type { WineType } from "@cellarboss/validators/constants";

export const WINE_TYPE_COLORS: Record<WineType, string> = {
  red: "bg-red-800",
  white: "bg-amber-200",
  rose: "bg-pink-400",
  orange: "bg-orange-400",
  sparkling: "bg-sky-300",
  fortified: "bg-amber-700",
  dessert: "bg-yellow-400",
};

export const WINE_TYPE_LABELS: Record<WineType, string> = {
  red: "Red",
  white: "White",
  rose: "Rosé",
  orange: "Orange",
  sparkling: "Sparkling",
  fortified: "Fortified",
  dessert: "Dessert",
};
