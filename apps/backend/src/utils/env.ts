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
    UPLOAD_DIR: z
      .string()
      .refine((p) => existsSync(p), {
        message: "UPLOAD_DIR path does not exist",
      })
      .optional(),
  })
  .parse(process.env);
