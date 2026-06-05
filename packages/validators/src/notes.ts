import { z } from "zod";

// UI/API guardrail for free-text notes. Storage remains a long text column.
export const NOTES_MAX_LENGTH = 5000;

export const notesSchema = z
  .string()
  .max(NOTES_MAX_LENGTH)
  .nullable()
  .optional()
  .describe("Free-text notes");

export const notesFormSchema = z
  .string()
  .max(NOTES_MAX_LENGTH)
  .default("")
  .describe("Free-text notes");
