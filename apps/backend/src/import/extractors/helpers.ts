import { load } from "cheerio";
import type { Extracted, FieldSource, RawValue } from "../types.js";
import { cleanText } from "../normalise/text.js";

/** Wraps a found value, or returns undefined when there is nothing useful. */
export function found(
  value: unknown,
  source: FieldSource,
  confidence: number,
): Extracted<RawValue> | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return { value: String(value), source, confidence };
  }
  if (typeof value === "string") {
    const text = cleanText(decodeEntities(value));
    return text ? { value: text, source, confidence } : undefined;
  }
  if (Array.isArray(value)) {
    const items = value
      .filter(
        (v): v is string | number =>
          typeof v === "string" || typeof v === "number",
      )
      .map((v) => cleanText(decodeEntities(String(v))))
      .filter(Boolean);
    return items.length ? { value: items, source, confidence } : undefined;
  }
  return undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A value from a site adapter's own knowledge of the page. Highest precedence. */
export function fromSite(value: unknown, confidence = 0.9) {
  return found(value, "site", confidence);
}

/** A value from a site's JSON API. */
export function fromApi(value: unknown, confidence = 0.95) {
  return found(value, "api", confidence);
}

/**
 * Decodes HTML entities left in JSON and attribute values, e.g. the
 * "Ch&acirc;teau" some sites put in JSON-LD. Text read from the DOM is
 * already decoded, so this is a no-op there.
 */
export function decodeEntities(value: string): string {
  return value.includes("&") ? load(value, null, false).text() : value;
}
