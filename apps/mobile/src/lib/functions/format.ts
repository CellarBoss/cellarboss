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
