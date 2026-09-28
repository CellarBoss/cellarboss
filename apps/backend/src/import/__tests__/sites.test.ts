import { describe, it, expect } from "vitest";
import { load } from "cheerio";
import { buildContext, ImporterRegistry } from "../index.js";
import { readInlineObject } from "../extractors/index.js";

const registry = new ImporterRegistry();
const importerFor = (url: string) => registry.forUrl(new URL(url));

describe("site importers", () => {
  it.each([
    [
      "https://www.thewinesociety.com/product/x-2020-en.aspx",
      "the-wine-society",
    ],
    ["https://www.nakedwines.co.uk/wines/x-2024", "naked-wines"],
    ["https://www.nakedwines.com/wines/x-2024", "naked-wines"],
    ["https://www.vivino.com/GB/en/x/w/1?year=2021", "vivino"],
    ["https://shop.example.com/wine", "generic"],
  ])("picks the importer for %s", (url, id) => {
    expect(importerFor(url).id).toBe(id);
  });

  it("lists the three supported sites", () => {
    expect(registry.sites().map((site) => site.label)).toEqual([
      "The Wine Society",
      "Naked Wines",
      "Vivino",
    ]);
  });
});

describe("VivinoImporter.apiRequests", () => {
  const url = "https://www.vivino.com/GB/en/x/w/66284?year=2021";
  const importer = importerFor(url);

  it("asks for nothing until the page names the vintage", () => {
    expect(importer.apiRequests(buildContext({ url, html: "" }))).toEqual([]);
  });

  it("reads the vintage id from the page's app link", () => {
    const html =
      '<meta property="al:android:url" content="vivino://?vintage_id=173991458">';
    expect(
      importer.apiRequests(buildContext({ url, html })).map((u) => u.href),
    ).toEqual(["https://www.vivino.com/api/vintages/173991458"]);
  });

  it("prefers the page's vintage over the link's, falling back to the link", () => {
    const linked = `${url}&vintage_id=42`;
    const html =
      '<meta property="al:android:url" content="vivino://?vintage_id=173991458">';
    expect(
      importer
        .apiRequests(buildContext({ url: linked, html }))
        .map((u) => u.href),
    ).toEqual(["https://www.vivino.com/api/vintages/173991458"]);
    expect(
      importer
        .apiRequests(buildContext({ url: linked, html: "" }))
        .map((u) => u.href),
    ).toEqual(["https://www.vivino.com/api/vintages/42"]);
  });
});

describe("readInlineObject", () => {
  it("reads the JSON a script assigns, ignoring braces in strings", () => {
    const $ = load(
      `<script>var a = 1;
        const product = {"name":"Brace } and \\"quote\\"","list":[1,{"b":2}]};
        doSomething(product);</script>`,
    );
    expect(readInlineObject($, "product")).toEqual({
      name: 'Brace } and "quote"',
      list: [1, { b: 2 }],
    });
  });

  it("ignores other variables and scripts that aren't JSON", () => {
    const $ = load(
      `<script>const productList = {"a":1};</script>
       <script>const product = { name: 'not json' };</script>`,
    );
    expect(readInlineObject($, "product")).toBeUndefined();
  });
});
