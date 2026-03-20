import { api } from "@/lib/api/client";
import type { FieldConfig } from "@/lib/types/field";
import type { Vintage } from "@cellarboss/types";

export const vintageFields: FieldConfig<Vintage>[] = [
  {
    key: "wineId",
    label: "Wine",
    type: "selector",
    selectorConfig: {
      queryKey: "wines",
      queryFn: () => api.wines.getAll(),
      groupBy: {
        key: "wineMakerId",
        queryKey: "winemakers",
        queryFn: () => api.winemakers.getAll(),
      },
    },
  },
  {
    key: "year",
    label: "Year",
    type: "number",
    numberProps: { min: 1800, max: 2100 },
  },
  {
    key: "drinkFrom",
    label: "Drink From",
    type: "number",
    numberProps: { min: 1800, max: 2200 },
  },
  {
    key: "drinkUntil",
    label: "Drink Until",
    type: "number",
    numberProps: { min: 1800, max: 2200 },
  },
];
