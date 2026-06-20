import { z } from "zod";
import {
  BOTTLE_SIZES,
  BOTTLE_STATUSES,
  WINE_TYPES,
} from "@cellarboss/validators/constants";

const currentYear = new Date().getFullYear();

/** Either an existing id or a non-empty new name (exactly one). */
const resolvedEntitySchema = z
  .object({
    existingId: z.number().int().positive().nullable(),
    newName: z.string().trim().min(1).max(255).nullable(),
  })
  .refine((v) => (v.existingId == null) !== (v.newName == null), {
    message: "Choose an existing entry or provide a name for a new one",
  });

const yearSchema = z
  .number()
  .int()
  .min(1900)
  .max(currentYear + 1)
  .nullable();

export const reconciledImportSchema = z
  .object({
    existingWineId: z.number().int().positive().nullable(),
    wine: z.object({
      name: z.string().trim().min(1).max(255),
      type: z.enum(WINE_TYPES),
    }),
    winemaker: resolvedEntitySchema.nullable(),
    country: resolvedEntitySchema.nullable(),
    region: resolvedEntitySchema.nullable(),
    grapes: z.array(resolvedEntitySchema).max(20),
    vintage: z.object({
      year: yearSchema,
      drinkFrom: yearSchema,
      drinkUntil: yearSchema,
    }),
    bottle: z.object({
      purchaseDate: z.string().min(1),
      purchasePrice: z.number().min(0),
      storageId: z.number().int().positive().nullable(),
      status: z.enum(BOTTLE_STATUSES),
      size: z.enum(BOTTLE_SIZES),
      quantity: z.number().int().min(1).max(240),
    }),
  })
  .superRefine((data, ctx) => {
    // The dependent fields only matter when creating a new wine.
    if (data.existingWineId != null) return;

    if (data.winemaker == null) {
      ctx.addIssue({
        code: "custom",
        path: ["winemaker"],
        message: "A winemaker is required for a new wine",
      });
    }

    // When creating a new region, a country (existing or new) is required so
    // the region is never attached to the wrong / no country.
    if (data.region?.newName != null && data.country == null) {
      ctx.addIssue({
        code: "custom",
        path: ["country"],
        message: "A country is required to create a new region",
      });
    }
  });

export const scrapeRequestSchema = z.object({
  url: z.url("Enter a valid URL"),
});
