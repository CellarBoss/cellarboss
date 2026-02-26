import { z } from "zod";

export const createLocationSchema = z.object({
  name: z.string().min(1).max(255).trim(),
});

export const updateLocationSchema = createLocationSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
