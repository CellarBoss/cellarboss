import { z } from "zod";

export const notesSchema = z
  .string()
  .nullable()
  .optional()
  .describe("Free-text notes");

export const notesFormSchema = z
  .string()
  .default("")
  .describe("Free-text notes");
