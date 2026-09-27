import type { Extractor } from "../types.js";
import { found } from "./helpers.js";

const SOURCE = "open-graph";

/** Reads OpenGraph and product meta tags. Low confidence: titles often carry site names. */
export const openGraph: Extractor = ({ meta }) => ({
  // Drop a trailing site name: "Haut-Médoc 2018 | Example Wines".
  title: found(meta.get("og:title")?.split(" | ")[0], SOURCE, 0.4),
  image: found(meta.get("og:image"), SOURCE, 0.5),
  price: found(
    meta.get("product:price:amount") ?? meta.get("og:price:amount"),
    SOURCE,
    0.5,
  ),
  currency: found(
    meta.get("product:price:currency") ?? meta.get("og:price:currency"),
    SOURCE,
    0.5,
  ),
});
