import { z } from "zod";

export const imageResponseSchema = z.object({
  id: z.number().describe("Unique identifier"),
  vintageId: z.number().describe("ID of the associated vintage"),
  filename: z.string().describe("UUID-based stored filename"),
  size: z.number().describe("File size in bytes"),
  sortOrder: z.number().describe("Display order"),
  createdBy: z.string().describe("ID of the user who uploaded the image"),
  createdAt: z.string().describe("ISO 8601 upload timestamp"),
});
