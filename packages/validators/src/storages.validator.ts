import { z } from "zod";
import { nullableId } from "./form-helpers";

export const createStorageSchema = z.object({
  name: z.string().min(1).max(255).trim().describe("Name of the storage unit"),
  locationId: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe("ID of the location, or null if not assigned"),
  parent: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe("ID of the parent storage, or null if top-level"),
});

export const storageFormValidators = {
  name: createStorageSchema.shape.name,
  locationId: nullableId(),
  parent: nullableId(),
} as const;

export const updateStorageSchema = createStorageSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
