import type { FieldConfig } from "@/lib/types/field";
import type { Grape } from "@cellarboss/types";

export const grapeFields: FieldConfig<Grape>[] = [
  {
    key: "name",
    label: "Name",
  },
];
