import { z } from "zod";

export const createWineGrapeSchema = z.object({
  wineId: z.number().int().positive().describe("ID of the wine"),
  grapeId: z.number().int().positive().describe("ID of the grape variety"),
});

export const updateWineGrapeSchema = createWineGrapeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
