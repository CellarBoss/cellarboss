import { api } from "@/lib/api/client";
import { formatStatus, formatBottleSize } from "@/lib/functions/format";
import type { FieldConfig } from "@/lib/types/field";
import type { Bottle } from "@cellarboss/types";
import {
  BOTTLE_STATUSES,
  BOTTLE_SIZES,
  bottleFormValidators,
} from "@cellarboss/validators";

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
      queryFn: () => api.storages.getAll(),
      allowNone: true,
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
