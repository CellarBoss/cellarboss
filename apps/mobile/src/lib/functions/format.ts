import { BOTTLE_SIZE_LABELS } from "../types/bottle";

export function formatPrice(price: number | string, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(typeof price === "string" ? parseFloat(price) : price);
  } catch {
    return `${Number(price).toFixed(2)} ${currency}`;
  }
}

export type DrinkingStatus = "drinkable" | "wait" | "past" | "unknown";

export function formatDrinkingStatus(
  drinkFrom: number | null,
  drinkUntil: number | null,
  currentYear: number,
): DrinkingStatus {
  if (drinkFrom === null && drinkUntil === null) return "unknown";
  if (drinkUntil !== null && currentYear > drinkUntil) return "past";
  if (drinkFrom !== null && currentYear < drinkFrom) return "wait";
  return "drinkable";
}

export function formatDrinkingWindow(
  begin: number | null,
  end: number | null,
): string {
  if (begin !== null && end !== null) return `${begin} until ${end}`;
  if (begin === null && end !== null) return `Now until ${end}`;
  if (begin !== null) return `From ${begin}`;
  if (end !== null) return `Until ${end}`;
  return "-";
}

export function formatStatus(s: string) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
export function formatBottleSize(s: string) {
  return BOTTLE_SIZE_LABELS[s] ?? formatStatus(s);
}
