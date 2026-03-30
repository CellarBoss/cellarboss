import { z } from "zod";
import { nullableInt } from "./form-helpers.js";

export const createVintageSchema = z.object({
  year: z
    .number()
    .int()
    .min(1800)
    .max(2100)
    .nullable()
    .describe("Vintage year, or null for non-vintage"),
  wineId: z.number().int().positive().describe("ID of the wine"),
  drinkFrom: z
    .number()
    .int()
    .min(1800)
    .max(2200)
    .nullable()
    .describe("Earliest recommended drinking year, or null"),
  drinkUntil: z
    .number()
    .int()
    .min(1800)
    .max(2200)
    .nullable()
    .describe("Latest recommended drinking year, or null"),
});

export const vintageFormValidators = {
  wineId: z.coerce.number().int().positive("A wine must be selected"),
  year: nullableInt(1800, 2100),
  drinkFrom: nullableInt(1800, 2200),
  drinkUntil: nullableInt(1800, 2200),
} as const;

export const updateVintageSchema = createVintageSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
