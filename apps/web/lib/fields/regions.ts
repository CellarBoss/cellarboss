import type { Region } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { regionFormValidators } from "@cellarboss/validators/regions.validator";
import { getCountries } from "@/lib/api/countries";

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
      queryFn: getCountries,
    },
    validator: regionFormValidators.countryId,
  },
];
