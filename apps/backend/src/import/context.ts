import { load } from "cheerio";
import type { ImportContext } from "./types.js";

export interface BuildContextInput {
  url: URL | string;
  html: string;
  api?: { url: URL | string; body: string }[];
  currentYear?: number;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Parses a page once so every extractor can share the DOM and embedded data. */
export function buildContext(input: BuildContextInput): ImportContext {
  const $ = load(input.html);

  const jsonLd: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const parsed = parseJson($(el).text());
    if (parsed !== undefined) jsonLd.push(parsed);
  });

  const embeddedJson: unknown[] = [];
  $('script#__NEXT_DATA__, script[type="application/json"]').each((_, el) => {
    const parsed = parseJson($(el).text());
    if (parsed !== undefined) embeddedJson.push(parsed);
  });

  const meta = new Map<string, string>();
  $("meta").each((_, el) => {
    const key = ($(el).attr("property") ?? $(el).attr("name"))?.toLowerCase();
    const content = $(el).attr("content");
    if (key && content && !meta.has(key)) meta.set(key, content);
  });

  const api = (input.api ?? []).flatMap(({ url, body }) => {
    const data = parseJson(body);
    return data === undefined ? [] : [{ url: new URL(url), data }];
  });

  return {
    url: new URL(input.url),
    $,
    jsonLd,
    meta,
    embeddedJson,
    api,
    currentYear: input.currentYear ?? new Date().getFullYear(),
  };
}
