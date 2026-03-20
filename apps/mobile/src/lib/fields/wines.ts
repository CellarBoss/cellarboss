import { api } from "@/lib/api/client";
import type { FieldConfig } from "@/lib/types/field";
import type { Wine } from "@cellarboss/types";
import { WINE_TYPES } from "@cellarboss/validators/constants";
import { WINE_TYPE_LABELS } from "./WINE_TYPE_LABELS";

export type WineFormData = Wine & { grapeIds: number[] };

export const wineFields: FieldConfig<WineFormData>[] = [
  { key: "name", label: "Name" },
  {
    key: "type",
    label: "Type",
    type: "fixed-list",
    options: WINE_TYPES.map((t) => ({
      value: t,
      label: WINE_TYPE_LABELS[t] ?? t,
    })),
  },
  {
    key: "wineMakerId",
    label: "Winemaker",
    type: "selector",
    selectorConfig: {
      queryKey: "winemakers",
      queryFn: () => api.winemakers.getAll(),
    },
  },
  {
    key: "regionId",
    label: "Region",
    type: "selector",
    selectorConfig: {
      queryKey: "regions",
      queryFn: () => api.regions.getAll(),
      allowNone: true,
      groupBy: {
        key: "countryId",
        queryKey: "countries",
        queryFn: () => api.countries.getAll(),
      },
    },
  },
  {
    key: "grapeIds",
    label: "Grapes",
    type: "selector",
    selectorConfig: {
      queryKey: "grapes",
      queryFn: () => api.grapes.getAll(),
      allowMultiple: true,
    },
  },
];
