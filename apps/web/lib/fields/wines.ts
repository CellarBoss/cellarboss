import * as z from "zod";
import type { Wine } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { wineFormValidators } from "@cellarboss/validators/wines.validator";
import { WINE_TYPES } from "@cellarboss/validators/constants";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getGrapes } from "@/lib/api/grapes";
import { getCountries } from "@/lib/api/countries";
import { formatWineType } from "../functions/format";

export type WineFormData = Wine & { grapeIds: number[] };

export const wineFields: FieldConfig<WineFormData>[] = [
  {
    key: "name",
    label: "Name",
    validator: wineFormValidators.name,
  },
  {
    key: "type",
    label: "Type",
    type: "fixed-list",
    options: WINE_TYPES.map((t) => ({ value: t, label: formatWineType(t) })),
    validator: wineFormValidators.type,
  },
  {
    key: "wineMakerId",
    label: "Winemaker",
    type: "selector",
    selectorConfig: {
      queryKey: "winemakers",
      queryFn: getWinemakers,
    },
    validator: wineFormValidators.wineMakerId,
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
    validator: wineFormValidators.regionId,
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
