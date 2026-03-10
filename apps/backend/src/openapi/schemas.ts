import { z } from "@hono/zod-openapi";
import {
  BOTTLE_STATUSES,
  createBottleSchema,
  createCountrySchema,
  createGrapeSchema,
  createLocationSchema,
  createRegionSchema,
  createStorageSchema,
  createVintageSchema,
  createWineGrapeSchema,
  createWineMakerSchema,
  createWineSchema,
} from "@cellarboss/validators";

// Shared error/success responses
export const errorSchema = z.object({ error: z.string() });
export const successSchema = z.object({ success: z.boolean() });

// Path parameter schemas
export const idParamSchema = z.object({
  id: z.string().openapi({ description: "Resource ID", example: "1" }),
});

// Response schemas derived from create schemas + id field

export const countryResponseSchema = createCountrySchema.extend({
  id: z.number(),
});

export const grapeResponseSchema = createGrapeSchema.extend({
  id: z.number(),
});

export const locationResponseSchema = createLocationSchema.extend({
  id: z.number(),
});

export const wineMakerResponseSchema = createWineMakerSchema.extend({
  id: z.number(),
});

export const regionResponseSchema = createRegionSchema.extend({
  id: z.number(),
});

export const storageResponseSchema = createStorageSchema.extend({
  id: z.number(),
});

export const wineResponseSchema = createWineSchema.extend({
  id: z.number(),
});

export const vintageResponseSchema = createVintageSchema.extend({
  id: z.number(),
});

export const bottleResponseSchema = createBottleSchema.extend({
  id: z.number(),
});

export const bottleCountsResponseSchema = z.object({
  status: z.enum(BOTTLE_STATUSES),
  count: z.number(),
});

export const wineGrapeResponseSchema = createWineGrapeSchema.extend({
  id: z.number(),
});

// No matching create schema in validators — defined manually
export const settingResponseSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
});
