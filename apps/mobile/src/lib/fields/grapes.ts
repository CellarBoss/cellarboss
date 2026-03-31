import type { FieldConfig } from "@/lib/types/field";
import type { Grape } from "@cellarboss/types";
import { createGrapeSchema } from "@cellarboss/validators/grapes.validator";

export const grapeFields: FieldConfig<Grape>[] = [
  {
    key: "name",
    label: "Name",
    validator: createGrapeSchema.shape.name,
  },
];
