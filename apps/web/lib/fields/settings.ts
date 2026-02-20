import type { FieldConfig } from "@/lib/types/field";
import * as z from "zod";

export type SettingFormData = {
  id: number;
  key: string;
  value: string;
};

export const settingFields: FieldConfig<SettingFormData>[] = [
  {
    key: "key",
    label: "Setting Key",
    type: "text",
    validator: z.string().min(1, "Key is required").max(255),
    editable: false,
  },
  {
    key: "value",
    label: "Value",
    type: "text",
    validator: z.string().min(0).max(10000),
  },
];
