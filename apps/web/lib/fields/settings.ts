import type { FieldConfig } from "@/lib/types/field";
import { SUPPORTED_LANGUAGE_OPTIONS } from "@cellarboss/common/i18n";
import * as z from "zod";

export type SettingFormData = {
  id: number;
  key: string;
  value: string;
};

const settingKeyField: FieldConfig<SettingFormData> = {
  key: "key",
  label: "Setting Key",
  type: "text",
  validator: z.string().min(1, "Key is required").max(255),
  editable: false,
};

export const settingFields: FieldConfig<SettingFormData>[] = [
  settingKeyField,
  {
    key: "value",
    label: "Value",
    type: "text",
    validator: z.string().min(0).max(10000),
  },
];

export function getSettingFields(key: string): FieldConfig<SettingFormData>[] {
  if (key === "language") {
    return [
      settingKeyField,
      {
        key: "value",
        label: "Language",
        type: "fixed-list",
        options: SUPPORTED_LANGUAGE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        })),
        validator: z.enum(["en", "es", "fr"]),
      },
    ];
  }

  return settingFields;
}
