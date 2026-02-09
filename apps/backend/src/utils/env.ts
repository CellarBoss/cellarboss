import { z } from "zod";

export const env = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string(),
  DATABASE_TYPE: z.enum(["sqlite", "postgres", "mysql"]),
  CORS: z.string().optional(),
}).parse(process.env);