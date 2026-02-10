import * as z from "zod";
import type { Region } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { createRegionSchema } from "@cellarboss/validators/regions.validator";

export const regionFields: FieldConfig<Region>[] = [
  {
    key: "name",
    label: "Name",
    validator: createRegionSchema.shape.name,
  },
  {
    key: "countryId",
    label: "Country",
    type: "country",
    // Coercion needed because GenericCard stringifies all form values
    validator: z.coerce.number().int().positive(),
  }
];
