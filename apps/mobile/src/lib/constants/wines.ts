import type { WineType } from "@cellarboss/validators/constants";

export { WINE_TYPE_LABELS } from "@cellarboss/common/constants";

export const WINE_TYPE_COLORS: Record<WineType, string> = {
  red: "#991b1b",
  white: "#fbbf24",
  rose: "#f472b6",
  orange: "#fb923c",
  sparkling: "#7dd3fc",
  fortified: "#b45309",
  dessert: "#facc15",
};
