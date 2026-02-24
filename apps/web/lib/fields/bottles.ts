import * as z from "zod";
import type { Bottle } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { getStorages } from "@/lib/api/storages";
import { BOTTLE_STATUSES } from "@cellarboss/validators/constants";
import { formatStatus } from "@/lib/functions/format";

export type BottleFormData = Bottle & { quantity: number };

export const bottleFields: FieldConfig<Bottle>[] = [
  {
    key: "purchaseDate",
    label: "Purchase Date",
    type: "date",
    validator: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)"),
  },
  {
    key: "purchasePrice",
    label: "Purchase Price",
    type: "number",
    numberProps: { min: 0, step: 0.01 },
    validator: z.coerce.number().nonnegative("Price must be non-negative"),
  },
  {
    key: "vintageId",
    label: "Vintage",
    type: "wine-vintage",
    validator: z.coerce.number().int().positive(),
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
    validator: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined ? null : Number(val),
      z.number().int().positive().nullable(),
    ),
  },
  {
    key: "status",
    label: "Status",
    type: "fixed-list",
    options: BOTTLE_STATUSES.map((s) => ({ value: s, label: formatStatus(s) })),
    validator: z.enum(BOTTLE_STATUSES),
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
