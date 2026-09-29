import { existsSync } from "fs";
import { z } from "zod";

export const env = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.string(),
    DATABASE_TYPE: z.enum(["sqlite", "postgres", "mysql"]),
    BETTER_AUTH_SECRET: z.string(),
    CORS: z.string().optional(),
    APP_VERSION: z.string().default("development"),
    PORT: z.number().default(5000),
    DB_RETRY_INTERVAL: z.coerce.number().default(2000),
    DB_MAX_RETRIES: z.coerce.number().default(30),
    LOG_LEVEL: z
      .enum(["trace", "debug", "info", "warn", "error"])
      .default("info"),
    MCP_ENABLED: z.stringbool().default(false),
    // Sends only import requests (fetching retailer pages) through this
    // proxy: http://, https:// or socks5://. HTTPS_PROXY and NO_PROXY are
    // honoured for import requests when this is unset.
    IMPORT_PROXY_URL: z.url().optional(),
    UPLOAD_DIR: z
      .string()
      .refine((p) => existsSync(p), {
        message: "UPLOAD_DIR path does not exist",
      })
      .optional(),
  })
  .parse(process.env);
