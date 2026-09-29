import type { Extractor } from "../types.js";
import { found } from "./helpers.js";

/**
 * Uses the page's main heading as the title when nothing better exists.
 * Lowest confidence: some pages use an h1 for the logo or a banner.
 */
export const pageHeading: Extractor = ({ $ }) => {
  const heading = $("h1")
    .toArray()
    .map((h1) => {
      // Keep "Terrace Edge<br>Sauvignon Blanc" as two words.
      const node = $(h1).clone();
      node.find("br").replaceWith(" ");
      return node.text();
    })
    .find((text) => text.trim());
  return { title: found(heading, "heuristic", 0.3) };
};
