import { z } from "zod";
import { BOTTLE_STATUSES, BOTTLE_SIZES } from "./constants";
import { nullableId } from "./form-helpers";

export const createBottleSchema = z.object({
  purchaseDate: z.iso
    .date()
    .describe("Date the bottle was purchased (ISO date)"),
  purchasePrice: z.number().nonnegative().describe("Price paid for the bottle"),
  vintageId: z
    .number()
    .int()
    .positive()
    .describe("ID of the vintage this bottle belongs to"),
  storageId: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe("ID of the storage location, or null if not stored"),
  status: z.enum(BOTTLE_STATUSES).describe("Current status of the bottle"),
  size: z.enum(BOTTLE_SIZES).describe("Size of the bottle"),
});

/**
 * Per-field validators for bottle forms. These accept string inputs (as produced
 * by stringifyValues) and coerce numeric fields, so they can be used directly in
 * both web and mobile field configs.
 */
export const bottleFormValidators = {
  purchaseDate: z.iso.date(),
  purchasePrice: z.coerce.number().nonnegative("Price must be non-negative"),
  vintageId: z.coerce.number().int().positive("A vintage must be selected"),
  storageId: nullableId(),
  status: z.enum(BOTTLE_STATUSES),
  size: z.enum(BOTTLE_SIZES),
} as const;

export const updateBottleSchema = createBottleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
