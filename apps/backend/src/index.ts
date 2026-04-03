import "dotenv/config";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { auth } from "@utils/auth.js";
import { env } from "@utils/env.js";
import { registerRoutes } from "@routes/index.js";
import { errorHandler } from "@middleware/error.middleware.js";

const app = new OpenAPIHono();

app.onError(errorHandler);

// CORS
app.use(
  cors({
    origin:
      env.CORS ||
      (env.NODE_ENV === "development" ? "http://localhost:3000" : ""),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Base route, testing only
app.get("/", (c) => c.text("Hello World!"));

// Register authentication routes
app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Register API routes
const api = new OpenAPIHono();
registerRoutes(api);

// OpenAPI spec endpoint
api.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Cellarboss API",
    version: env.APP_VERSION,
    description: "Wine cellar management API",
  },
});

// Scalar API reference UI
api.get(
  "/docs",
  Scalar({
    url: "/api/openapi.json",
    theme: "kepler",
  }),
);

app.route("/api", api);

serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
  },
);
