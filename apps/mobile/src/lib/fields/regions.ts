import { api } from "@/lib/api/client";
import type { FieldConfig } from "@/lib/types/field";
import type { Region } from "@cellarboss/types";
import { regionFormValidators } from "@cellarboss/validators/regions.validator";

export const regionFields: FieldConfig<Region>[] = [
  {
    key: "name",
    label: "Name",
    validator: regionFormValidators.name,
  },
  {
    key: "countryId",
    label: "Country",
    type: "selector",
    selectorConfig: {
      queryKey: "countries",
      queryFn: () => api.countries.getAll(),
    },
    validator: regionFormValidators.countryId,
  },
];
