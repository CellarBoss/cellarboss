import { z } from 'zod';

export const createStorageSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  locationId: z.number().int().positive().nullable(),
  parent: z.number().int().positive().nullable(),
});

export const updateStorageSchema = createStorageSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);
