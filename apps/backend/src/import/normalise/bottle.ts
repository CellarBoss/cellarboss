import type { BottleSize } from "@cellarboss/validators";
import { foldKey } from "./text.js";

const SIZE_NAMES: [string, BottleSize][] = [
  ["double magnum", "double-magnum"],
  ["nebuchadnezzar", "nebuchadnezzar"],
  ["balthazar", "balthazar"],
  ["salmanazar", "salmanazar"],
  ["imperial", "imperial"],
  ["jeroboam", "jeroboam"],
  ["magnum", "magnum"],
  ["half bottle", "half"],
  ["piccolo", "piccolo"],
];

// Millilitres to size. Jeroboam covers both the 3 l Champagne and 4.5–5 l
// Bordeaux bottles, so 3 l maps to double magnum as the more common name.
const SIZE_BY_ML: [number, BottleSize][] = [
  [200, "piccolo"],
  [375, "half"],
  [750, "standard"],
  [1000, "litre"],
  [1500, "magnum"],
  [3000, "double-magnum"],
  [5000, "jeroboam"],
  [6000, "imperial"],
  [9000, "salmanazar"],
  [12000, "balthazar"],
  [15000, "nebuchadnezzar"],
];

const UNIT_TO_ML: Record<string, number> = {
  ml: 1,
  cl: 10,
  l: 1000,
  ltr: 1000,
  litre: 1000,
  liter: 1000,
};

/** Reads a bottle size from "75cl", "0,75 l", "1.5L", "750ml" or "Magnum". */
export function parseBottleSize(value: string): BottleSize | undefined {
  const key = ` ${foldKey(value)} `;
  for (const [name, size] of SIZE_NAMES) {
    if (key.includes(` ${name} `)) return size;
  }

  const match = value
    .toLowerCase()
    .match(/(\d+(?:[.,]\d+)?)\s*(ml|cl|ltr|litre|liter|l)\b/);
  if (!match) return undefined;

  const ml = Number(match[1].replace(",", ".")) * UNIT_TO_ML[match[2]];
  // Allow a little slack for 187.5 ml piccolos and 700 ml bottles.
  const closest = SIZE_BY_ML.reduce((best, entry) =>
    Math.abs(entry[0] - ml) < Math.abs(best[0] - ml) ? entry : best,
  );
  return Math.abs(closest[0] - ml) / closest[0] <= 0.1 ? closest[1] : undefined;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  "£": "GBP",
  "€": "EUR",
  $: "USD",
};

/**
 * Reads a price such as "£12.50", "12,50 €" or "1.234,56". The currency comes
 * from a symbol in the text or the separate `currency` value, else null.
 */
export function parsePrice(
  value: string,
  currency?: string,
): { amount: number; currency: string | null } | undefined {
  const match = value.match(/\d[\d.,\s]*/);
  if (!match) return undefined;

  let digits = match[0].replace(/\s/g, "").replace(/[.,]$/, "");
  const lastSep = Math.max(digits.lastIndexOf("."), digits.lastIndexOf(","));
  if (lastSep !== -1 && digits.length - lastSep - 1 === 2) {
    // The last separator is the decimal point; the rest are thousands separators.
    digits =
      digits.slice(0, lastSep).replace(/[.,]/g, "") +
      "." +
      digits.slice(lastSep + 1);
  } else {
    digits = digits.replace(/[.,]/g, "");
  }

  const amount = Number(digits);
  if (!Number.isFinite(amount)) return undefined;

  const symbol = Object.keys(CURRENCY_SYMBOLS).find((s) => value.includes(s));
  const code =
    currency?.trim().toUpperCase() ||
    (symbol ? CURRENCY_SYMBOLS[symbol] : undefined) ||
    value.match(/\b([A-Z]{3})\b/)?.[1];
  return { amount, currency: code ?? null };
}
