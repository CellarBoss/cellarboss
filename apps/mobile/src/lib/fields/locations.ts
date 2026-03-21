import type { FieldConfig } from "@/lib/types/field";
import type { Location } from "@cellarboss/types";

export const locationFields: FieldConfig<Location>[] = [
  {
    key: "name",
    label: "Name",
  },
];
