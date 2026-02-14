import * as z from "zod";
import type { Wine } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { createWineSchema } from "@cellarboss/validators/wines.validator";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getGrapes } from "@/lib/api/grapes";
import { getCountries } from "@/lib/api/countries";

export type WineFormData = Wine & { grapeIds: number[] };

export const wineFields: FieldConfig<WineFormData>[] = [
  {
    key: "name",
    label: "Name",
    validator: createWineSchema.shape.name,
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
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z.number().int().positive().nullable()
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
    validator: z.preprocess(
      (val) => {
        if (!Array.isArray(val)) return [];
        return val.map((v: any) => Number(v));
      },
      z.array(z.number().int().positive())
    ) as any,
  },
];
