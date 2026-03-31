import { z } from "zod";

export const createRegionSchema = z.object({
  name: z.string().min(1).max(255).trim().describe("Name of the region"),
  countryId: z.coerce
    .number()
    .int()
    .positive()
    .describe("ID of the country this region belongs to"),
});

export const regionFormValidators = {
  name: createRegionSchema.shape.name,
  countryId: z.coerce.number().int().positive("A country must be selected"),
} as const;

export const updateRegionSchema = createRegionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
