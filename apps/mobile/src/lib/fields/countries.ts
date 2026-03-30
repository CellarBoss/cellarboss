import type { FieldConfig } from "@/lib/types/field";
import type { Country } from "@cellarboss/types";
import { createCountrySchema } from "@cellarboss/validators/countries.validator";

export const countryFields: FieldConfig<Country>[] = [
  {
    key: "name",
    label: "Name",
    validator: createCountrySchema.shape.name,
  },
];
