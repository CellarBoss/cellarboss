import * as z from "zod";
import type { Bottle } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { getStorages } from "@/lib/api/storages";
import {
  BOTTLE_STATUSES,
  BOTTLE_SIZES,
  bottleFormValidators,
} from "@cellarboss/validators";
import { formatStatus, formatBottleSize } from "@/lib/functions/format";

export type BottleFormData = Bottle & { quantity: number };

export const bottleFields: FieldConfig<Bottle>[] = [
  {
    key: "purchaseDate",
    label: "Purchase Date",
    type: "date",
    validator: bottleFormValidators.purchaseDate,
  },
  {
    key: "purchasePrice",
    label: "Purchase Price",
    type: "number",
    numberProps: { min: 0, step: 0.01 },
    validator: bottleFormValidators.purchasePrice,
  },
  {
    key: "vintageId",
    label: "Vintage",
    type: "wine-vintage",
    validator: bottleFormValidators.vintageId,
  },
  {
    key: "storageId",
    label: "Storage",
    type: "selector",
    selectorConfig: {
      queryKey: "storages",
      queryFn: getStorages,
      hierarchical: true,
    },
    validator: bottleFormValidators.storageId,
  },
  {
    key: "status",
    label: "Status",
    type: "fixed-list",
    options: BOTTLE_STATUSES.map((s) => ({ value: s, label: formatStatus(s) })),
    validator: bottleFormValidators.status,
  },
  {
    key: "size",
    label: "Size",
    type: "fixed-list",
    options: BOTTLE_SIZES.map((s) => ({
      value: s,
      label: formatBottleSize(s),
    })),
    validator: bottleFormValidators.size,
  },
];

export const bottleCreateFields: FieldConfig<BottleFormData>[] = [
  ...(bottleFields as FieldConfig<BottleFormData>[]),
  {
    key: "quantity",
    label: "Quantity",
    type: "number",
    numberProps: { min: 1, step: 1 },
    validator: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  },
];
