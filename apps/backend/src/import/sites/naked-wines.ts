import { BaseImporter, type RequiredField } from "../base-importer.js";
import { fromSite, isRecord, readInlineObject } from "../extractors/index.js";
import type { ImportContext, RawWine } from "../types.js";

/**
 * nakedwines.co.uk, .com and .com.au. Product pages are rendered in the
 * browser from a `const product = {...}` object in an inline script, so
 * that object is the only reliable source.
 */
export class NakedWinesImporter extends BaseImporter {
  readonly id = "naked-wines";
  readonly label = "Naked Wines";
  readonly hosts = ["nakedwines.co.uk", "nakedwines.com", "nakedwines.com.au"];
  override readonly required: RequiredField[] = [
    "name",
    "winemaker",
    "type",
    "vintage",
  ];
  override readonly inlineObjects = ["product"];

  protected override extractSite({ $ }: ImportContext): RawWine {
    const product = readInlineObject($, "product");
    if (!isRecord(product)) return {};

    const producer = isRecord(product.producer) ? product.producer : {};
    const winemaker = [producer.firstName, producer.lastName]
      .filter((part) => typeof part === "string" && part.trim())
      .join(" ");

    return {
      title: fromSite(product.productName),
      vintage: fromSite(product.vintage),
      winemaker: fromSite(winemaker),
      country: fromSite(product.origin),
      region: fromSite(product.region),
      grapes: fromSite(grapes(product)),
      // "RED_BIG" and "WHITE_ZESTY" name the colour; "Big Red" doesn't always.
      type: fromSite(
        typeof product.productStyleCode === "string"
          ? `${product.productStyleCode.replace(/_/g, " ")} ${String(product.productStyleDesc ?? "")}`
          : product.productStyleDesc,
      ),
      drinkingWindow: fromSite(product.ageingAdvice),
      size: fromSite(product.sizeDescription),
    };
  }
}

/**
 * The blend's grapes when listed, otherwise the main grape. Naked Wines
 * names a grape with its synonym ("Syrah | Shiraz") and a blend by its main
 * grape ("Chardonnay Blend"), so only the first name is kept, and a plain
 * "Red Blend" gives nothing.
 */
function grapes(product: Record<string, unknown>): string[] {
  const listed = Array.isArray(product.grape)
    ? product.grape
        .map((grape) => (isRecord(grape) ? grape.name : grape))
        .filter((name): name is string => typeof name === "string")
    : [];
  const names = listed.length
    ? listed
    : typeof product.wineGrape === "string"
      ? [product.wineGrape]
      : [];
  return names
    .map((name) =>
      name
        .split("|")[0]
        .replace(/\bblend\b/i, "")
        .trim(),
    )
    .filter((name) => name && !/^(red|white|rose|rosé)$/i.test(name));
}
