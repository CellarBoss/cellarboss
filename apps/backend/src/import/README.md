# Import from URL

Reads wine and vintage details from a retailer or Vivino page and matches
them to existing records. Everything here is pure: it parses and matches but
never touches the network or the database, so it's tested against saved
pages. The backend's fetcher and import routes do the I/O.

## How an import works

1. `ImporterRegistry.forUrl(url)` picks a site adapter, or `GenericImporter`
   when no adapter handles the host.
2. The backend fetches the page (and any `apiRequests()`), then
   `buildContext()` parses it once.
3. `importer.extract(ctx)` runs the generic extractors (the page h1, OpenGraph, microdata,
   labelled facts tables, JSON-LD), then the adapter's `extractSite()` and
   `extractApi()`. Each field comes from the most confident source.
4. `normalise()` turns the raw strings into typed values: the wine name
   without producer, vintage or size, a `WineType`, the vintage year and
   drinking window, split region and grape lists.
5. `reconcileWine()` matches the winemaker, country, region and grapes to
   existing records as `matched`, `suggested` or `new`.

## Adding a site

Record a page first, so the adapter has a real target:

```bash
pnpm --filter @cellarboss/backend import:recon <product-url>
```

This saves the page under `__tests__/fixtures/<importer>/<slug>/` with a
draft `expected.json`. See [the fixtures README](__tests__/fixtures/README.md).

If the site lists its facts as label/value pairs, the adapter is a config:

```ts
export const exampleImporter = defineLabelTableImporter({
  id: "example",
  label: "Example Wines",
  hosts: ["example.com"],
  container: ".product-details",
  labels: { Producer: "winemaker", Region: "region", Grape: "grapes" },
});
```

Otherwise extend `BaseImporter` and override only what the site needs:
`extractSite()` for page knowledge, `apiRequests()` with `extractApi()` for a
site JSON endpoint, and `inlineObjects` for JSON a page assigns in an inline
script (read it with `readInlineObject()`). See `sites/` for one of each:
The Wine Society reads the page, Naked Wines an inline object and Vivino
its API. List the adapter in `sites/index.ts`, then record
at least two pages and review their `expected.json`.

Name variants that should match existing records (Shiraz for Syrah, Toscana
for Tuscany) go in `normalise/aliases.ts`.
