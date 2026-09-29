import { cleanText, foldKey } from "./text.js";

// Trailing size or pack text: "75cl", "6 x 75cl", "(Magnum)", "Case of 6".
const SIZE_OR_PACK =
  /\b(?:\d+\s*x\s*)?\d+(?:[.,]\d+)?\s*(?:ml|cl|ltr|litre|liter|l)\b|\bcase of \d+\b|\b(?:half bottle|magnum|double magnum|jeroboam)\b/gi;

const EDGE_PUNCTUATION = /^[\s,;:–—\-|/()]+|[\s,;:–—\-|/()]+$/g;

/**
 * Turns a retailer's title into a CellarBoss wine name by removing the
 * producer, the vintage and any size or pack text:
 * "Château Cissac, Haut-Médoc 2018" by "Château Cissac" gives "Haut-Médoc".
 */
export function deriveWineName(
  title: string,
  options: { winemaker?: string; year?: number | null } = {},
): string {
  let name = cleanText(title);

  if (options.year) {
    name = name.replace(new RegExp(`(?<!\\d)${options.year}(?!\\d)`, "g"), " ");
  }
  name = name.replace(/\bN\.?V\.?\b|\bnon[- ]vintage\b/gi, " ");
  name = name.replace(SIZE_OR_PACK, " ");

  if (options.winemaker) name = removeWinemaker(name, options.winemaker);

  name = cleanText(name.replace(/\(\s*\)/g, " ")).replace(EDGE_PUNCTUATION, "");
  return cleanText(name) || cleanText(title);
}

/**
 * Removes the winemaker's name from the title, matching on folded words so
 * "Chateau Cissac" also removes "Château Cissac" and "Kobie & Faisal" removes
 * "Kobie and Faisal". Only a run of whole words is removed, never the whole
 * title, and a "by" left in front of it goes too.
 */
function removeWinemaker(name: string, winemaker: string): string {
  const target = foldKey(winemaker);
  if (!target) return name;

  const parts = name.split(/(\s+)/); // words and the whitespace between them
  const words = parts
    .map((text, index) => ({ text, index }))
    .filter(({ text }) => text.trim() !== "");

  for (let start = 0; start < words.length; start++) {
    let folded = "";
    for (let end = start; end < words.length; end++) {
      folded = [folded, foldKey(words[end].text)].filter(Boolean).join(" ");
      if (folded.length > target.length) break;
      if (folded !== target) continue;
      if (start === 0 && end === words.length - 1) return name;

      let first = words[start].index;
      if (start > 0 && foldKey(words[start - 1].text) === "by") {
        first = words[start - 1].index;
      }
      const last = words[end].index;
      // Keep punctuation that trails the last word, e.g. the comma in "Cissac,".
      const trailing = parts[last].replace(/^[\p{L}\p{N}'’.&-]+/u, "");
      return [
        ...parts.slice(0, first),
        trailing,
        ...parts.slice(last + 1),
      ].join("");
    }
  }
  return name;
}
