import { z } from "zod";
import { WINE_TYPES } from "./constants";

/** Largest page a client may send for the "supplied" strategy. */
export const IMPORT_MAX_HTML_LENGTH = 3_000_000;

export const importPreviewSchema = z.object({
  url: z
    .url({ protocol: /^https?$/ })
    .max(2048)
    .describe("Product page to import from"),
  html: z
    .string()
    .max(IMPORT_MAX_HTML_LENGTH)
    .optional()
    .describe(
      "The page's HTML, sent from the user's own browser instead of fetching it",
    ),
});

const id = z.number().int().positive();
const name = z.string().trim().min(1).max(255);
const year = (max: number) => z.number().int().min(1800).max(max).nullable();

export const importEntityRefSchema = z
  .union([z.object({ id }), z.object({ name })])
  .describe("An existing record by id, or a new one by name");

export const importCommitSchema = z.object({
  wine: z.union([
    z.object({ id }).describe("An existing wine to add the vintage to"),
    z.object({
      name: name.describe("Name of the new wine"),
      type: z.enum(WINE_TYPES),
      winemaker: importEntityRefSchema,
      country: importEntityRefSchema
        .nullable()
        .describe("Country, needed when the region is new"),
      region: importEntityRefSchema.nullable(),
      grapes: z.array(importEntityRefSchema).max(20),
    }),
  ]),
  vintage: z.object({
    year: year(2100),
    drinkFrom: year(2200),
    drinkUntil: year(2200),
  }),
});
