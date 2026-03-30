import type { Vintage } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { vintageFormValidators } from "@cellarboss/validators/vintages.validator";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";

export const vintageFields: FieldConfig<Vintage>[] = [
  {
    key: "year",
    label: "Year",
    validator: vintageFormValidators.year,
  },
  {
    key: "wineId",
    label: "Wine",
    type: "selector",
    selectorConfig: {
      queryKey: "wines",
      queryFn: getWines,
      groupBy: {
        key: "wineMakerId",
        queryKey: "winemakers",
        queryFn: getWinemakers,
      },
    },
    validator: vintageFormValidators.wineId,
  },
  {
    key: "drinkFrom",
    label: "Drink From",
    validator: vintageFormValidators.drinkFrom,
  },
  {
    key: "drinkUntil",
    label: "Drink Until",
    validator: vintageFormValidators.drinkUntil,
  },
];
