import type { DrinkingStatus } from "@/lib/functions/format";
import type { AppTheme } from "@/lib/theme";

export function getDrinkingStatusColors(
  theme: AppTheme,
): Record<DrinkingStatus, string> {
  return {
    drinkable: "#16a34a",
    wait: "#ca8a04",
    past: "#dc2626",
    unknown: theme.colors.onSurfaceVariant,
  };
}

export const DRINKING_STATUS_LABELS: Record<DrinkingStatus, string> = {
  drinkable: "Drinkable now",
  wait: "Wait to drink",
  past: "Past peak",
  unknown: "",
};

export const DRINKING_STATUS_ICONS: Record<DrinkingStatus, string> = {
  drinkable: "check-circle",
  wait: "clock-outline",
  past: "alert-circle",
  unknown: "",
};
