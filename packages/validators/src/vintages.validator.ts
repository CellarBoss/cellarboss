import { z } from 'zod';

export const createVintageSchema = z.object({
  year: z.number().int().min(1800).max(2100).nullable(),
  wineId: z.number().int().positive(),
  drinkFrom: z.number().int().min(1800).max(2200).nullable(),
  drinkUntil: z.number().int().min(1800).max(2200).nullable(),
});

export const updateVintageSchema = createVintageSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);
