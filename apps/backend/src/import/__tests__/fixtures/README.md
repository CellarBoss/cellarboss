# Recorded pages

Each folder holds one real product page, recorded with
`pnpm --filter @cellarboss/backend import:recon <url>`:

- `page.html`: the page as served, trimmed to what the extractors read
  (scripts other than JSON data, styles, SVGs and iframes are removed)
- `api/*.json`: JSON responses the page fetched from its own site
- `expected.json`: the fields the import must produce. Every field listed is
  required. The recon script writes a draft with `"reviewed": false`; check
  each value against the page, then set it to `true`. Unreviewed fixtures
  fail the tests.

Pages are someone else's content, so keep only what the tests need.
