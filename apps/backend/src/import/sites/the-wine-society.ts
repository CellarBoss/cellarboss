import type { CheerioAPI } from "cheerio";
import { BaseImporter, type RequiredField } from "../base-importer.js";
import { fromSite } from "../extractors/index.js";
import { cleanText } from "../normalise/text.js";
import type { ImportContext, RawField, RawWine } from "../types.js";

/** The icons The Wine Society uses to label its "Wine characteristics" list. */
const CHARACTERISTICS: Record<string, RawField> = {
  Style: "type",
  "Grape-Type": "grapes",
  "Drink-Date": "drinkingWindow",
  "Unit-Amount": "size",
};

/** Shown as the producer when a wine has no producer profile. */
const PLACEHOLDER_PRODUCER = /^generic producer$/i;

/**
 * thewinesociety.com. Product pages are server-rendered with no structured
 * data: the title holds the wine name and vintage, a line under it reads
 * "Red Wine from France - Bordeaux", and the characteristics list is keyed
 * by icon rather than by text label.
 */
export class TheWineSocietyImporter extends BaseImporter {
  readonly id = "the-wine-society";
  readonly label = "The Wine Society";
  readonly hosts = ["thewinesociety.com"];
  override readonly required: RequiredField[] = ["name", "type"];

  protected override extractSite({ $ }: ImportContext): RawWine {
    const result: RawWine = {
      title: fromSite($("h1.product-details__name").first().text()),
      ...origin($),
    };

    const producer = cleanText($("#collapseProducerContent h4").first().text());
    if (!PLACEHOLDER_PRODUCER.test(producer)) {
      result.winemaker = fromSite(producer);
    }

    $(".product-characteristics li").each((_, el) => {
      // The parser keeps xlink:href as "href".
      const use = $(el).find("use");
      const icon = (use.attr("href") ?? use.attr("xlink:href"))
        ?.split("#")
        .pop();
      const field = icon ? CHARACTERISTICS[icon] : undefined;
      if (field && !result[field]) {
        result[field] = fromSite($(el).find("span").first().text());
      }
    });

    return result;
  }
}

/** Reads "Red Wine from France - Bordeaux" into type, country and region. */
function origin($: CheerioAPI): RawWine {
  const text = cleanText($(".product-details__origin").first().text());
  const match = /^(.*?)\s+from\s+(.+?)(?:\s+[-–]\s+(.+))?$/i.exec(text);
  if (!match) return {};
  const [, style, country, region] = match;
  return {
    type: fromSite(style, 0.8),
    country: fromSite(country),
    region: fromSite(region),
  };
}
