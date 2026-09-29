import type { Extractor } from "../types.js";
import { found } from "./helpers.js";

const SOURCE = "microdata";

/** Reads schema.org Product microdata (itemprop attributes). */
export const microdata: Extractor = ({ $ }) => {
  const product = $('[itemscope][itemtype*="schema.org/Product"]').first();
  if (!product.length) return {};

  // Own properties skip nested items, such as the brand's name; offer
  // properties live in a nested Offer, so those search at any depth.
  const prop = (name: string, anyDepth = false): string | undefined => {
    const el = product
      .find(`[itemprop="${name}"]`)
      .filter(
        (_, node) =>
          anyDepth || $(node).parent().closest("[itemscope]").is(product),
      )
      .first();
    if (!el.length) return undefined;
    return el.attr("content") ?? el.attr("src") ?? el.attr("href") ?? el.text();
  };

  const brand = product.find('[itemprop="brand"]').first();
  const brandName = brand.find('[itemprop="name"]').first();

  return {
    title: found(prop("name"), SOURCE, 0.7),
    winemaker: found(
      brandName.length
        ? brandName.text()
        : (brand.attr("content") ?? brand.text()),
      SOURCE,
      0.5,
    ),
    image: found(prop("image"), SOURCE, 0.6),
    price: found(prop("price", true), SOURCE, 0.7),
    currency: found(prop("priceCurrency", true), SOURCE, 0.7),
  };
};
