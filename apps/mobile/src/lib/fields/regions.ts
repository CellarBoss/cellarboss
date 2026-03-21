import { api } from "@/lib/api/client";
import type { FieldConfig } from "@/lib/types/field";
import type { Region } from "@cellarboss/types";

export const regionFields: FieldConfig<Region>[] = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "countryId",
    label: "Country",
    type: "selector",
    selectorConfig: {
      queryKey: "countries",
      queryFn: () => api.countries.getAll(),
    },
  },
];
