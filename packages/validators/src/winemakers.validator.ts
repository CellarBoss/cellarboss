import { z } from "zod";

export const createWineMakerSchema = z.object({
  name: z.string().min(1).max(255).trim().describe("Name of the wine maker"),
});

export const updateWineMakerSchema = createWineMakerSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
