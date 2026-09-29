import { cleanText } from "./text.js";

/**
 * Splits a grape list into names, dropping percentages:
 * "70% Merlot, Cabernet Sauvignon (30%)" gives ["Merlot", "Cabernet Sauvignon"].
 */
export function splitGrapes(value: string | string[]): string[] {
  const parts = Array.isArray(value)
    ? value
    : value.split(/\s*(?:,|;|\/|\+|&|\band\b)\s*/i);

  const names = parts
    .map((part) =>
      cleanText(
        part
          .replace(/\(?\s*\d+(?:[.,]\d+)?\s*%\s*\)?/g, " ")
          .replace(/^[-–—:\s]+|[-–—:\s]+$/g, ""),
      ),
    )
    .filter(Boolean);

  return [...new Set(names)];
}
