import { z } from 'zod';

export const createRegionSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  countryId: z.number().int().positive(),
});

export const updateRegionSchema = createRegionSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);
