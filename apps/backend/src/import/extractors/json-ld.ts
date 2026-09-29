import type { Extractor, RawWine } from "../types.js";
import { foldKey } from "../normalise/text.js";
import { LABEL_FIELDS } from "./label-table.js";
import { found, isRecord } from "./helpers.js";

const SOURCE = "json-ld";

function hasType(node: Record<string, unknown>, type: string): boolean {
  const types = node["@type"];
  return Array.isArray(types) ? types.includes(type) : types === type;
}

/** Every node in the JSON-LD blocks, including ones nested in @graph or arrays. */
function flatten(value: unknown, out: Record<string, unknown>[] = []) {
  if (Array.isArray(value)) {
    value.forEach((v) => flatten(v, out));
  } else if (isRecord(value)) {
    out.push(value);
    if ("@graph" in value) flatten(value["@graph"], out);
  }
  return out;
}

function nameOf(value: unknown): unknown {
  if (Array.isArray(value)) return nameOf(value[0]);
  return isRecord(value) ? value.name : value;
}

function firstOffer(offers: unknown): Record<string, unknown> | undefined {
  const list = Array.isArray(offers) ? offers : [offers];
  for (const offer of list) {
    if (!isRecord(offer)) continue;
    if (hasType(offer, "AggregateOffer"))
      return firstOffer(offer.offers) ?? offer;
    return offer;
  }
  return undefined;
}

/** Reads schema.org Product data: name, brand, image, offers and additionalProperty. */
export const jsonLd: Extractor = (ctx) => {
  const product = ctx.jsonLd
    .flatMap((block) => flatten(block))
    .find((node) => hasType(node, "Product"));
  if (!product) return {};

  const offer = firstOffer(product.offers);
  const image = Array.isArray(product.image) ? product.image[0] : product.image;

  const result: RawWine = {
    title: found(product.name, SOURCE, 0.8),
    winemaker: found(
      nameOf(product.brand ?? product.manufacturer),
      SOURCE,
      0.5,
    ),
    country: found(nameOf(product.countryOfOrigin), SOURCE, 0.7),
    image: found(isRecord(image) ? image.url : image, SOURCE, 0.7),
    price: found(offer?.price ?? offer?.lowPrice, SOURCE, 0.8),
    currency: found(offer?.priceCurrency, SOURCE, 0.8),
  };

  const properties = Array.isArray(product.additionalProperty)
    ? product.additionalProperty
    : [];
  for (const property of properties) {
    if (!isRecord(property) || typeof property.name !== "string") continue;
    const field = LABEL_FIELDS[foldKey(property.name)];
    if (field && !result[field])
      result[field] = found(property.value, SOURCE, 0.7);
  }

  return result;
};
