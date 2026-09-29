import type { Cheerio, CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";
import type { Extractor, RawField, RawWine } from "../types.js";
import { cleanText, foldKey } from "../normalise/text.js";
import { found } from "./helpers.js";

/** Common facts-table labels, by folded key, and the field each one fills. */
export const LABEL_FIELDS: Record<string, RawField> = {
  producer: "winemaker",
  winery: "winemaker",
  winemaker: "winemaker",
  "wine maker": "winemaker",
  maker: "winemaker",
  estate: "winemaker",
  country: "country",
  "country of origin": "country",
  region: "region",
  "sub region": "region",
  subregion: "region",
  appellation: "region",
  "wine region": "region",
  district: "region",
  grape: "grapes",
  grapes: "grapes",
  "grape variety": "grapes",
  "grape varieties": "grapes",
  "grape list": "grapes",
  variety: "grapes",
  varietal: "grapes",
  varietals: "grapes",
  blend: "grapes",
  colour: "type",
  color: "type",
  "wine type": "type",
  "wine colour": "type",
  "wine color": "type",
  style: "type",
  "wine style": "type",
  type: "type",
  vintage: "vintage",
  year: "vintage",
  drink: "drinkingWindow",
  drinking: "drinkingWindow",
  "drinking window": "drinkingWindow",
  "drink window": "drinkingWindow",
  "drink by": "drinkingWindow",
  "drink from": "drinkingWindow",
  "when to drink": "drinkingWindow",
  "ready to drink": "drinkingWindow",
  maturity: "drinkingWindow",
  size: "size",
  "bottle size": "size",
  volume: "size",
};

const MAX_LABEL_LENGTH = 40;
const MAX_VALUE_LENGTH = 200;

/** Every label/value pair in `dl`, two-cell table rows and "Label: value" items. */
export function collectLabelPairs(
  $: CheerioAPI,
  root?: string,
): [label: string, value: string][] {
  const scope = root ? $(root) : $.root();
  const pairs: [string, string][] = [];
  const add = (label: string, value: string) => {
    const l = cleanText(label).replace(/:$/, "");
    const v = cleanText(value);
    if (
      l &&
      v &&
      l.length <= MAX_LABEL_LENGTH &&
      v.length <= MAX_VALUE_LENGTH
    ) {
      pairs.push([l, v]);
    }
  };

  scope.find("dt").each((_, dt) => {
    const dd = $(dt).nextAll("dd").first();
    if (dd.length) add($(dt).text(), textWithSeparators($, dd));
  });

  scope.find("tr").each((_, tr) => {
    const cells = $(tr).children("th, td");
    if (cells.length === 2)
      add(cells.eq(0).text(), textWithSeparators($, cells.eq(1)));
  });

  scope.find("li, p").each((_, el) => {
    const text = cleanText($(el).text());
    const colon = text.indexOf(":");
    if (colon > 0 && colon <= MAX_LABEL_LENGTH) {
      add(text.slice(0, colon), text.slice(colon + 1));
    }
  });

  // A label element followed by bare text in the same cell:
  // <td><div class="header">Region</div> North Canterbury</td>. Only bare
  // text counts, so a menu item with a nested list is never read as a value.
  scope.find("td, th, dd, li, div, p").each((_, el) => {
    const children = $(el)
      .contents()
      .toArray()
      .filter((node) => node.type !== "comment");
    const first = children.find(
      (node) => node.type !== "text" || $(node).text().trim(),
    );
    if (first?.type !== "tag") return;
    const rest = children.filter(
      (node) => node.type === "text" && $(node).text().trim(),
    );
    if (!rest.length) return;
    add($(first).text(), rest.map((node) => $(node).text()).join(" "));
  });

  return pairs;
}

/** Joins list items and line breaks with commas so "Merlot<br>Malbec" stays two grapes. */
function textWithSeparators($: CheerioAPI, el: Cheerio<AnyNode>): string {
  const SEPARATOR = "\uE000";
  const node = el.clone();
  node.find("br").replaceWith(SEPARATOR);
  node.find("li, a").each((_, child) => {
    $(child).append(SEPARATOR);
  });
  return node
    .text()
    .replace(/\s*(\uE000\s*)+$/, "")
    .replace(/\s*,?\s*(\uE000\s*)+,?\s*/g, ", ");
}

/**
 * Returns a lookup for a labelled facts section. Labels are matched on their
 * folded form, so "Grape:" and "grape" are the same.
 */
export function labelTableReader($: CheerioAPI, root?: string) {
  const byLabel = new Map<string, string>();
  for (const [label, value] of collectLabelPairs($, root)) {
    const key = foldKey(label);
    if (!byLabel.has(key)) byLabel.set(key, value);
  }
  return (label: string): string | undefined => byLabel.get(foldKey(label));
}

/** Maps any recognised facts-table labels on the page to fields. */
export const labelTable: Extractor = ({ $ }) => {
  const result: RawWine = {};
  for (const [label, value] of collectLabelPairs($)) {
    const field = LABEL_FIELDS[foldKey(label)];
    if (field && !result[field])
      result[field] = found(value, "label-table", 0.6);
  }
  return result;
};
