import * as z from "zod";
import type { Vintage } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { getWines } from "@/lib/api/wines";

function nullableInt(min: number, max: number) {
  return z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().int().min(min).max(max).nullable()
  );
}

export const vintageFields: FieldConfig<Vintage>[] = [
  {
    key: "year",
    label: "Year",
    validator: nullableInt(1800, 2100),
  },
  {
    key: "wineId",
    label: "Wine",
    type: "selector",
    selectorConfig: {
      queryKey: "wines",
      queryFn: getWines,
    },
    validator: z.coerce.number().int().positive(),
  },
  {
    key: "drinkFrom",
    label: "Drink From",
    validator: nullableInt(1800, 2200),
  },
  {
    key: "drinkUntil",
    label: "Drink Until",
    validator: nullableInt(1800, 2200),
  },
];
