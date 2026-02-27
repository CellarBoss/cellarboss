import { z } from "zod";

export const createTastingNoteSchema = z.object({
  vintageId: z.number().int().positive(),
  score: z.number().min(0).max(10),
  notes: z.string().trim(),
});

export const updateTastingNoteSchema = z
  .object({
    score: z.number().min(0).max(10).optional(),
    notes: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
