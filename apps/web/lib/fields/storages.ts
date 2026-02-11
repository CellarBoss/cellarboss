import * as z from "zod";
import type { Storage } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { createStorageSchema } from "@cellarboss/validators/storages.validator";

export const storageFields: FieldConfig<Storage>[] = [
  {
    key: "name",
    label: "Name",
    validator: createStorageSchema.shape.name,
  },
  {
    key: "locationId",
    label: "Location",
    type: "location",
    validator: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z.number().int().positive().nullable()
    ),
  },
  {
    key: "parent",
    label: "Parent Storage",
    type: "storage",
    validator: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z.number().int().positive().nullable()
    ),
  },
];
