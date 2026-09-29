import { foldKey } from "./text.js";

const EARLIEST_VINTAGE = 1800;

/**
 * Reads a vintage year. "NV" and "Non-vintage" give null; text without a
 * plausible year gives undefined.
 */
export function parseVintage(
  value: string,
  currentYear: number,
): number | null | undefined {
  const key = foldKey(value);
  if (/\b(nv|non vintage|multi vintage)\b/.test(key)) return null;
  return findYear(value, currentYear);
}

/** The first plausible four-digit vintage year in the text, if any. */
export function findYear(
  value: string,
  currentYear: number,
): number | undefined {
  for (const match of value.matchAll(/(?<!\d)(\d{4})(?!\d)/g)) {
    const year = Number(match[1]);
    if (year >= EARLIEST_VINTAGE && year <= currentYear + 1) return year;
  }
  return undefined;
}
