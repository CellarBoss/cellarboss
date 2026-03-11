/**
 * Generates static OpenAPI documentation.
 *
 * Sets dummy env vars so route modules can be imported without a real
 * database connection. No queries are executed — only route definitions
 * are read to build the OpenAPI spec.
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Set required env vars before importing app modules (must use dynamic import)
process.env.NODE_ENV = "production";
process.env.DATABASE_TYPE = "sqlite";
process.env.DATABASE_URL = ":memory:";
process.env.BETTER_AUTH_SECRET = "docs-generation-dummy-secret";

const { OpenAPIHono } = await import("@hono/zod-openapi");
const { registerRoutes } = await import("../src/routes/index.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../docs");

// Build the OpenAPI spec
const api = new OpenAPIHono();
registerRoutes(api);

const spec = api.getOpenAPI31Document({
  openapi: "3.1.0",
  info: {
    title: "Cellarboss API",
    version: process.env.APP_VERSION || "development",
    description: "Wine cellar management API",
  },
  servers: [
    {
      url: "http://cellarboss:5000/api",
    },
    {
      url: "http://localhost:5000/api",
    },
  ],
});

// Add tag descriptions
spec.tags = [
  {
    name: "Bottles",
    description:
      "Individual bottles of wine in the cellar. Each bottle belongs to a vintage and can be assigned to a storage location.",
  },
  {
    name: "Countries",
    description: "Countries where wine-producing regions are located.",
  },
  {
    name: "Grapes",
    description:
      "Grape varieties used in winemaking. Linked to wines via wine-grape associations.",
  },
  {
    name: "Locations",
    description:
      "Physical locations (e.g. a house or warehouse) that contain storage units.",
  },
  {
    name: "Regions",
    description:
      "Wine-producing regions within a country (e.g. Bordeaux, Barossa Valley).",
  },
  {
    name: "Settings",
    description: "Application-wide configuration settings.",
  },
  {
    name: "Storages",
    description:
      "Storage units (e.g. racks, fridges, shelves) that hold bottles. Can be nested with a parent-child hierarchy.",
  },
  {
    name: "Vintages",
    description:
      "A specific vintage (year) of a wine. Bottles are stored against a vintage rather than directly against a wine.",
  },
  {
    name: "Wine Grapes",
    description:
      "Associations between wines and grape varieties, representing the blend composition of a wine.",
  },
  {
    name: "Winemakers",
    description: "Wine producers and estates.",
  },
  {
    name: "Wines",
    description:
      "Wine records representing a distinct wine label from a winemaker, independent of vintage.",
  },
];

// Write JSON spec
mkdirSync(outDir, { recursive: true });
const specPath = resolve(outDir, "openapi.json");
writeFileSync(specPath, JSON.stringify(spec, null, 2));
console.log(`OpenAPI spec written to ${specPath}`);

// Generate static HTML with inlined spec (works when opened as a local file)
const specJson = JSON.stringify(spec);
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cellarboss API Documentation</title>
</head>
<body>
  <script
    id="api-reference"
    type="application/json">${specJson}</script>
  <script>
    document.getElementById('api-reference').dataset.configuration = ${JSON.stringify(JSON.stringify({ theme: "kepler", _integration: "hono" }))};
  </script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;

const htmlPath = resolve(outDir, "index.html");
writeFileSync(htmlPath, html);
console.log(`API docs HTML written to ${htmlPath}`);
