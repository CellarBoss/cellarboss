import { z } from 'zod';

export const createWineSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  wineMakerId: z.number().int().positive(),
  regionId: z.number().int().positive().nullable(),
});

export const updateWineSchema = createWineSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);
