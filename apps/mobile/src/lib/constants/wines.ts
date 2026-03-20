import type { WineType } from "@cellarboss/validators/constants";

export const WINE_TYPE_LABELS: Record<string, string> = {
  red: "Red",
  white: "White",
  rose: "Rosé",
  orange: "Orange",
  sparkling: "Sparkling",
  fortified: "Fortified",
  dessert: "Dessert",
};

export const WINE_TYPE_COLORS: Record<WineType, string> = {
  red: "#991b1b",
  white: "#fbbf24",
  rose: "#f472b6",
  orange: "#fb923c",
  sparkling: "#7dd3fc",
  fortified: "#b45309",
  dessert: "#facc15",
};
