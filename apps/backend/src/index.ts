import "dotenv/config";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { auth } from "@utils/auth.js";
import { env } from "@utils/env.js";
import { registerRoutes } from "@routes/index.js";
import { errorHandler } from "@middleware/error.middleware.js";
import { honoLogLayer, type HonoLogLayerVariables } from "@loglayer/hono";
import { logger } from "@utils/logger.js";
import { log } from "console";

const app = new OpenAPIHono<{ Variables: HonoLogLayerVariables }>();

app.onError(errorHandler);
app.use(
  honoLogLayer({
    instance: logger,
    autoLogging: {
      request: { logLevel: "debug" },
      response: { logLevel: "info" },
    },
  }),
);

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
    title: "CellarBoss API",
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
    port: env.PORT,
  },
  (info) => {
    const dbUrl = (() => {
      try {
        const u = new URL(env.DATABASE_URL);
        u.password = u.password ? "***" : "";
        return u.toString();
      } catch {
        return env.DATABASE_URL;
      }
    })();

    logger
      .child()
      .withContext({
        version: env.APP_VERSION,
        env: env.NODE_ENV,
        url: `http://localhost:${info.port}`,
        cors: env.CORS || "(not configured)",
        database: env.DATABASE_TYPE,
        dbUrl,
        uploads: env.UPLOAD_DIR ?? "(not configured)",
        logLevel: env.LOG_LEVEL,
      })
      .info("CellarBoss backend started");
  },
);
