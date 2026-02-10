import type { WineMaker } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { createWineMakerSchema } from "@cellarboss/validators/winemakers.validator";

export const winemakerFields: FieldConfig<WineMaker>[] = [
  {
    key: "name",
    label: "Name",
    validator: createWineMakerSchema.shape.name,
  },
];
