import { z } from "zod";

export const preferenceKeySchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/,
    "Key must be lowercase dotted identifiers (e.g. columns.bottles)",
  );

export const upsertPreferenceSchema = z.object({
  value: z
    .string()
    .min(0)
    .max(100000)
    .trim()
    .describe("Preference value as a JSON string"),
});
