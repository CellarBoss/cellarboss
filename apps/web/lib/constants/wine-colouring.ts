import type { WineType } from "@cellarboss/validators/constants";

export { WINE_TYPE_LABELS } from "@cellarboss/common/constants";

export const WINE_TYPE_COLORS: Record<WineType, string> = {
  red: "bg-red-800",
  white: "bg-amber-200",
  rose: "bg-pink-400",
  orange: "bg-orange-400",
  sparkling: "bg-sky-300",
  fortified: "bg-amber-700",
  dessert: "bg-yellow-400",
};

export const WINE_TYPE_TEXT_COLORS: Record<WineType, string> = {
  red: "text-red-800",
  white: "text-amber-200",
  rose: "text-pink-400",
  orange: "text-orange-400",
  sparkling: "text-sky-300",
  fortified: "text-amber-700",
  dessert: "text-yellow-400",
};
