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
