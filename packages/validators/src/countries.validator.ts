import { z } from "zod";

export const createCountrySchema = z.object({
  name: z.string().min(1).max(255).trim().describe("Name of the country"),
});

export const updateCountrySchema = createCountrySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
