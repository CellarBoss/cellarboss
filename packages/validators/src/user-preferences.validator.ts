import { z } from "zod";
import type { JsonValue } from "@cellarboss/types";

export const userPreferenceKeySchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[A-Za-z0-9._:-]+$/, {
    message:
      "Preference keys may only contain letters, numbers, dots, underscores, hyphens, and colons",
  })
  .describe("User preference key");

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const upsertUserPreferenceSchema = z.object({
  value: jsonValueSchema.describe("JSON preference value"),
});
