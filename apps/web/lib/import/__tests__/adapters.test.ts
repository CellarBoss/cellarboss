import { describe, expect, it } from "vitest";
import { finaliseScrapedWine } from "../scrape/normalize";
import { theWineSociety } from "../scrape/adapters/the-wine-society";
import { nakedWines } from "../scrape/adapters/naked-wines";
import { pickAdapter } from "../scrape/registry";

const wineSocietyHtml = `<!doctype html><html><head>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Product",
 "name":"Château Coufran, Haut-Médoc 2016",
 "brand":{"@type":"Brand","name":"Château Coufran"},
 "image":"https://img.example/coufran.jpg",
 "description":"A classic, Merlot-dominated claret.",
 "offers":{"@type":"Offer","price":"19.50","priceCurrency":"GBP"}}
</script>
<meta property="og:image" content="https://og.example/coufran.jpg">
</head><body>
<dl class="wine-facts">
  <dt>Country</dt><dd>France</dd>
  <dt>Region</dt><dd>Bordeaux</dd>
  <dt>Grape</dt><dd>Merlot, Cabernet Sauvignon</dd>
  <dt>Style</dt><dd>Red</dd>
  <dt>Bottle size</dt><dd>75cl</dd>
</dl>
</body></html>`;

const nakedWinesHtml = `<!doctype html><html><head>
<script type="application/ld+json">
{"@type":"Product",
 "name":"Moerbei Testarosso Sangiovese 2024",
 "brand":"Moerbei",
 "image":["https://img.example/testarosso.jpg"],
 "offers":[{"price":"12.99","priceCurrency":"GBP"}]}
</script>
</head><body>
<table class="product-attributes">
  <tr><th>Country</th><td>Italy</td></tr>
  <tr><th>Region</th><td>Tuscany</td></tr>
  <tr><th>Grape</th><td>Sangiovese</td></tr>
  <tr><th>Style</th><td>Red</td></tr>
  <tr><th>Size</th><td>750ml</td></tr>
</table>
</body></html>`;

// The real Naked Wines page is client-rendered: no schema.org Product or spec
// table, just OpenGraph tags plus an inline `const product = {...}` blob.
const nakedWinesInlineHtml = `<!doctype html><html><head>
<meta property="og:title" content="Benjamin Darnault Minervois 2025" />
<meta property="og:description" content="A smooth, thoroughly quaffable classic." />
<meta property="og:image" content="https://img.example/darnault.jpg" />
<script>
const product = {"productName":"Benjamin Darnault Minervois 2025","vintage":"2025","closureType":"Cork","productFamily":{"category":"Red","name":"Benjamin Darnault Minervois"},"wineGrape":"Grenache Blend","grape":[],"origin":"France","countryCode":"FR","region":"Languedoc-Roussillon","producer":{"firstName":"Benjamin","lastName":"Darnault","urlString":"benjamin-darnault"},"productStyleDesc":"Fruity Red","bottleSize":750,"size":750,"listPrice":14.99,"salePrice":14.99,"angelPrice":10.99};
</script>
</head><body></body></html>`;

describe("registry.pickAdapter", () => {
  it("routes hostnames to the right adapter", () => {
    expect(
      pickAdapter(new URL("https://www.thewinesociety.com/product/x"))?.id,
    ).toBe("the-wine-society");
    expect(
      pickAdapter(new URL("https://www.nakedwines.co.uk/wines/x"))?.id,
    ).toBe("naked-wines");
    expect(pickAdapter(new URL("https://example.com/x"))).toBeNull();
  });
});

describe("The Wine Society adapter", () => {
  it("extracts full details from JSON-LD + spec list", () => {
    const url = new URL("https://www.thewinesociety.com/product/coufran");
    const wine = finaliseScrapedWine(
      theWineSociety.extract(wineSocietyHtml, url),
    );

    expect(wine.name).toBe("Château Coufran, Haut-Médoc 2016");
    expect(wine.winemaker).toBe("Château Coufran");
    expect(wine.country).toBe("France");
    expect(wine.region).toBe("Bordeaux");
    expect(wine.grapes).toEqual(["Merlot", "Cabernet Sauvignon"]);
    expect(wine.type).toBe("red");
    expect(wine.vintageYear).toBe(2016);
    expect(wine.volumeMl).toBe(750);
    expect(wine.price).toBe(19.5);
    expect(wine.imageUrl).toBe("https://img.example/coufran.jpg");
  });
});

describe("Naked Wines adapter", () => {
  it("extracts full details from JSON-LD + table", () => {
    const url = new URL("https://www.nakedwines.co.uk/wines/testarosso");
    const wine = finaliseScrapedWine(nakedWines.extract(nakedWinesHtml, url));

    expect(wine.name).toBe("Moerbei Testarosso Sangiovese 2024");
    expect(wine.winemaker).toBe("Moerbei");
    expect(wine.country).toBe("Italy");
    expect(wine.region).toBe("Tuscany");
    expect(wine.grapes).toEqual(["Sangiovese"]);
    expect(wine.type).toBe("red");
    expect(wine.vintageYear).toBe(2024);
    expect(wine.volumeMl).toBe(750);
    expect(wine.price).toBe(12.99);
    expect(wine.imageUrl).toBe("https://img.example/testarosso.jpg");
  });

  it("extracts details from the inline product blob of a client-rendered page", () => {
    const url = new URL(
      "https://www.nakedwines.co.uk/wines/benjamin-darnault-minervois-2025",
    );
    const wine = finaliseScrapedWine(
      nakedWines.extract(nakedWinesInlineHtml, url),
    );

    expect(wine.name).toBe("Benjamin Darnault Minervois 2025");
    expect(wine.winemaker).toBe("Benjamin Darnault");
    expect(wine.country).toBe("France");
    expect(wine.region).toBe("Languedoc-Roussillon");
    expect(wine.grapes).toEqual(["Grenache Blend"]);
    expect(wine.type).toBe("red");
    expect(wine.vintageYear).toBe(2025);
    expect(wine.volumeMl).toBe(750);
    expect(wine.price).toBe(14.99);
    expect(wine.imageUrl).toBe("https://img.example/darnault.jpg");
    expect(wine.description).toBe("A smooth, thoroughly quaffable classic.");
  });
});
