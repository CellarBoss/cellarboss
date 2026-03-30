import { z } from "zod";

export const createTastingNoteSchema = z.object({
  vintageId: z.number().int().positive(),
  score: z.number().int().min(0).max(10),
  notes: z.string().trim(),
});

export const tastingNoteFormValidators = {
  vintageId: z.coerce.number().int().positive("A vintage must be selected"),
  score: z.coerce
    .number()
    .int()
    .min(0, "Score must be 0-10")
    .max(10, "Score must be 0-10"),
  notes: z.string().trim(),
} as const;

export const updateTastingNoteSchema = z
  .object({
    score: z.number().int().min(0).max(10).optional(),
    notes: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
