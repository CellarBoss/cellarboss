import * as z from "zod";
import type { Wine } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { createWineSchema } from "@cellarboss/validators/wines.validator";
import { WINE_TYPES } from "@cellarboss/validators/constants";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getGrapes } from "@/lib/api/grapes";
import { getCountries } from "@/lib/api/countries";
import { WINE_TYPE_LABELS } from "@/lib/constants/wine-colouring";

export type WineFormData = Wine & { grapeIds: number[] };

export const wineFields: FieldConfig<WineFormData>[] = [
  {
    key: "name",
    label: "Name",
    validator: createWineSchema.shape.name,
  },
  {
    key: "type",
    label: "Type",
    type: "fixed-list",
    options: WINE_TYPES.map((t) => ({ value: t, label: WINE_TYPE_LABELS[t] })),
    validator: z.enum(WINE_TYPES),
  },
  {
    key: "wineMakerId",
    label: "Winemaker",
    type: "selector",
    selectorConfig: {
      queryKey: "winemakers",
      queryFn: getWinemakers,
    },
    validator: z.coerce.number().int().positive(),
  },
  {
    key: "regionId",
    label: "Region",
    type: "selector",
    selectorConfig: {
      queryKey: "regions",
      queryFn: getRegions,
      groupBy: {
        key: "countryId",
        queryKey: "countries",
        queryFn: getCountries,
      },
    },
    validator: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined ? null : Number(val),
      z.number().int().positive().nullable(),
    ),
  },
  {
    key: "grapeIds",
    label: "Grapes",
    type: "selector",
    selectorConfig: {
      queryKey: "grapes",
      queryFn: getGrapes,
      allowMultiple: true,
    },
    validator: z.preprocess((val) => {
      if (!Array.isArray(val)) return [];
      return val.map((v: any) => Number(v));
    }, z.array(z.number().int().positive())) as any,
  },
];
