import { z } from "@hono/zod-openapi";
import {
  BOTTLE_STATUSES,
  createBottleSchema,
  createCountrySchema,
  createGrapeSchema,
  createLocationSchema,
  createRegionSchema,
  createStorageSchema,
  createTastingNoteSchema,
  createVintageSchema,
  createWineGrapeSchema,
  createWineMakerSchema,
  createWineSchema,
} from "@cellarboss/validators";
export { imageResponseSchema } from "@cellarboss/validators";

// Shared error/success responses
export const errorSchema = z.object({
  error: z.string().describe("Error message"),
});
export const successSchema = z.object({
  success: z.boolean().describe("Whether the operation succeeded"),
});

// Path parameter schemas
export const idParamSchema = z.object({
  id: z.string().openapi({ description: "Resource ID", example: "1" }),
});

// Response schemas derived from create schemas + id field

export const countryResponseSchema = createCountrySchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const grapeResponseSchema = createGrapeSchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const locationResponseSchema = createLocationSchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const wineMakerResponseSchema = createWineMakerSchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const regionResponseSchema = createRegionSchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const storageResponseSchema = createStorageSchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const wineResponseSchema = createWineSchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const vintageResponseSchema = createVintageSchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const bottleResponseSchema = createBottleSchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const bottleCountsResponseSchema = z.object({
  status: z.enum(BOTTLE_STATUSES).describe("Bottle status"),
  count: z.number().describe("Number of bottles with this status"),
});

export const wineGrapeResponseSchema = createWineGrapeSchema.extend({
  id: z.number().describe("Unique identifier"),
});

export const tastingNoteResponseSchema = createTastingNoteSchema.extend({
  id: z.number().describe("Unique identifier"),
  date: z.string().describe("ISO 8601 date when the note was created"),
  authorId: z.string().describe("ID of the note author"),
  author: z.string().describe("Display name of the note author"),
});

// No matching create schema in validators — defined manually
export const settingResponseSchema = z.object({
  key: z.string().describe("Setting key"),
  value: z.string().describe("Setting value"),
});

export const userResponseSchema = z.object({
  id: z.string().describe("Unique user identifier"),
  name: z.string().describe("User's display name"),
  email: z.string().describe("User's email address"),
  role: z.string().describe("User's role"),
});
