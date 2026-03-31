import { api } from "@/lib/api/client";
import type { FieldConfig } from "@/lib/types/field";
import type { Vintage } from "@cellarboss/types";
import { vintageFormValidators } from "@cellarboss/validators/vintages.validator";

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
    validator: vintageFormValidators.wineId,
  },
  {
    key: "year",
    label: "Year",
    type: "number",
    numberProps: { min: 1800, max: 2100 },
    validator: vintageFormValidators.year,
  },
  {
    key: "drinkFrom",
    label: "Drink From",
    type: "number",
    numberProps: { min: 1800, max: 2200 },
    validator: vintageFormValidators.drinkFrom,
  },
  {
    key: "drinkUntil",
    label: "Drink Until",
    type: "number",
    numberProps: { min: 1800, max: 2200 },
    validator: vintageFormValidators.drinkUntil,
  },
];
