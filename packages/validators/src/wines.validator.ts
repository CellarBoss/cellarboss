import { z } from "zod";
import { WINE_TYPES } from "./constants";
import { nullableId } from "./form-helpers";

const notesSchema = z.string().trim().max(5000).describe("Free-text notes");

export const createWineSchema = z.object({
  name: z.string().min(1).max(255).trim().describe("Name of the wine"),
  wineMakerId: z.number().int().positive().describe("ID of the wine maker"),
  regionId: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe("ID of the region, or null"),
  notes: notesSchema.default(""),
  type: z.enum(WINE_TYPES).describe("Type of wine"),
});

export const wineFormValidators = {
  name: createWineSchema.shape.name,
  type: z.enum(WINE_TYPES),
  wineMakerId: z.coerce.number().int().positive("A winemaker must be selected"),
  regionId: nullableId(),
  notes: notesSchema.default(""),
} as const;

export const updateWineSchema = z
  .object({
    name: createWineSchema.shape.name,
    wineMakerId: createWineSchema.shape.wineMakerId,
    regionId: createWineSchema.shape.regionId,
    notes: notesSchema,
    type: createWineSchema.shape.type,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
