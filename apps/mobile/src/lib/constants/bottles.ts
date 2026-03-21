import type { BottleStatus } from "@cellarboss/validators/constants";
import { BOTTLE_STATUSES, WINE_TYPES } from "@cellarboss/validators/constants";
import { formatStatus } from "@/lib/functions/format";
import { WINE_TYPE_LABELS } from "@/lib/constants/wines";

export const BOTTLE_STATUS_COLORS: Record<BottleStatus, string> = {
  stored: "#2E8B57",
  ordered: "#3B82F6",
  "in-primeur": "#6B7280",
  drunk: "#9CA3AF",
  sold: "#6B7280",
  gifted: "#6B7280",
};

export function getStatusColor(status: string): string {
  return BOTTLE_STATUS_COLORS[status as BottleStatus] ?? "#6B7280";
}

export const STATUS_FILTER_OPTIONS = BOTTLE_STATUSES.map((s) => ({
  label: formatStatus(s),
  value: s,
}));

export const WINE_TYPE_FILTER_OPTIONS = WINE_TYPES.map((t) => ({
  label: WINE_TYPE_LABELS[t],
  value: t,
}));
