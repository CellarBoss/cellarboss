import * as z from "zod";
import type { Wine } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { createWineSchema } from "@cellarboss/validators/wines.validator";

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
    type: "winemaker",
    validator: z.coerce.number().int().positive(),
  },
  {
    key: "regionId",
    label: "Region",
    type: "region",
    validator: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z.number().int().positive().nullable()
    ),
  },
  {
    key: "grapeIds",
    label: "Grapes",
    type: "grapes",
    validator: z.preprocess(
      (val) => {
        if (!Array.isArray(val)) return [];
        return val.map((v: any) => Number(v));
      },
      z.array(z.number().int().positive())
    ) as any,
  },
];
