import { z } from 'zod';

export const createWineGrapeSchema = z.object({
  wineId: z.number().int().positive(),
  grapeId: z.number().int().positive(),
});

export const updateWineGrapeSchema = createWineGrapeSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);
