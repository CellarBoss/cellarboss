import { z } from "zod";
import { WINE_TYPES } from "./constants";

export const createWineSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  wineMakerId: z.number().int().positive(),
  regionId: z.number().int().positive().nullable(),
  type: z.enum(WINE_TYPES),
});

export const updateWineSchema = createWineSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
