import type { FieldConfig } from "@/lib/types/field";
import type { Country } from "@cellarboss/types";

export const countryFields: FieldConfig<Country>[] = [
  {
    key: "name",
    label: "Name",
  },
];
