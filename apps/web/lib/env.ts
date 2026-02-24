import { z } from "zod";

export const webEnv = z
  .object({
    CELLARBOSS_SERVER: z.url().optional().default("http://localhost:5000"),
    BETTER_AUTH_SECRET: z.string().optional(),
    BETTER_AUTH_URL: z.url().optional(),
  })
  .parse({
    CELLARBOSS_SERVER:
      process.env.NEXT_PUBLIC_CELLARBOSS_SERVER ||
      process.env.CELLARBOSS_SERVER,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  });
