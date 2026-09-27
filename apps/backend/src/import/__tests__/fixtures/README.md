# Recorded pages

Each folder holds one real product page, recorded with
`pnpm --filter @cellarboss/backend import:recon <url>`:

- `page.html`: the page as served, trimmed to what the extractors read
  (styles, iframes, icon drawings, very long attributes and scripts other
  than JSON data and the importer's `inlineObjects` are removed)
- `api/*.json`: the importer's `apiRequests()` responses, fetched as the
  backend would
- `expected.json`: the fields the import must produce. Every field listed is
  required. The recon script writes a draft with `"reviewed": false`; check
  each value against the page, then set it to `true`. Unreviewed fixtures
  fail the tests. Leave out a field the import can't get right and say why
  in `notes`.

Pages are someone else's content, so keep only what the tests need.
