import { z } from "zod";
import { WINE_TYPES } from "./constants";

export const createWineSchema = z.object({
  name: z.string().min(1).max(255).trim().describe("Name of the wine"),
  wineMakerId: z.number().int().positive().describe("ID of the wine maker"),
  regionId: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe("ID of the region, or null"),
  type: z.enum(WINE_TYPES).describe("Type of wine"),
});

export const updateWineSchema = createWineSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
