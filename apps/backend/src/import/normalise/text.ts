/** Trims, collapses whitespace and puts text into Unicode NFC form. */
export function cleanText(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

/** Removes accents: "Rhône" becomes "Rhone". */
export function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}

const ABBREVIATIONS: Record<string, string> = {
  ch: "chateau",
  chx: "chateaux",
  dom: "domaine",
  st: "saint",
  ste: "sainte",
  mt: "mount",
};

/**
 * A comparison key for names: no accents, lower case, "&" read as "and",
 * punctuation removed, a leading "by" dropped and common abbreviations
 * expanded. "By Kobie & Faisal" and "Kobie and Faisal" give the same key.
 */
export function foldKey(value: string): string {
  const words = stripDiacritics(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => ABBREVIATIONS[word] ?? word);

  if (words[0] === "by" && words.length > 1) words.shift();
  return words.join(" ");
}

/** Splits "Haut-Médoc, Bordeaux" or "France > Bordeaux" into parts. */
export function splitList(value: string | string[]): string[] {
  const parts = Array.isArray(value) ? value : value.split(/\s*[,;|>/]\s*/);
  return parts.map(cleanText).filter(Boolean);
}
