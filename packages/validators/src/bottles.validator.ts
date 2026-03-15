import { z } from "zod";
import { BOTTLE_STATUSES, BOTTLE_SIZES } from "./constants.js";

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

export const updateBottleSchema = createBottleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
