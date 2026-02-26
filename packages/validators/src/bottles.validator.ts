import { z } from "zod";
import { BOTTLE_STATUSES } from "./constants.js";

export const createBottleSchema = z.object({
  purchaseDate: z.iso.date(),
  purchasePrice: z.number().nonnegative(),
  vintageId: z.number().int().positive(),
  storageId: z.number().int().positive().nullable(),
  status: z.enum(BOTTLE_STATUSES),
});

export const updateBottleSchema = createBottleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
