import { RAW_FIELDS, type RawWine } from "./types.js";

/**
 * Combines extractor results field by field. Layers are given lowest
 * precedence first; a field is taken from the most confident layer, and a
 * later layer wins a tie. Empty values never replace a found one.
 */
export function mergeByPrecedence(layers: RawWine[]): RawWine {
  const merged: RawWine = {};
  for (const layer of layers) {
    for (const field of RAW_FIELDS) {
      const candidate = layer[field];
      if (!candidate || isEmpty(candidate.value)) continue;
      const current = merged[field];
      if (!current || candidate.confidence >= current.confidence) {
        merged[field] = candidate;
      }
    }
  }
  return merged;
}

function isEmpty(value: string | string[]): boolean {
  return Array.isArray(value)
    ? value.every((v) => v.trim() === "")
    : value.trim() === "";
}
