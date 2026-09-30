import { foldKey } from "./text.js";

export interface DrinkingWindow {
  from?: number;
  until?: number;
}

/**
 * Reads a drinking window: "Now to 2033", "Now – 2033", "2026-2030",
 * "Drink from 2027", "Until 2030" or "Drink now". "Now" means the current year.
 */
export function parseDrinkingWindow(
  value: string,
  currentYear: number,
): DrinkingWindow {
  const key = foldKey(value);
  const tokens = [...key.matchAll(/\bnow\b|\b\d{4}\b/g)].map((m) =>
    m[0] === "now" ? currentYear : Number(m[0]),
  );
  const years = tokens.filter((y) => y >= 1900 && y <= currentYear + 100);

  if (years.length >= 2) {
    const [a, b] = years;
    return { from: Math.min(a, b), until: Math.max(a, b) };
  }
  if (years.length === 1) {
    const [year] = years;
    if (/\b(until|by|before)\b/.test(key)) return { until: year };
    return { from: year };
  }
  return {};
}
