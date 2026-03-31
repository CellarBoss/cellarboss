import type { FieldConfig } from "@/lib/types/field";
import type { Location } from "@cellarboss/types";
import { createLocationSchema } from "@cellarboss/validators/locations.validator";

export const locationFields: FieldConfig<Location>[] = [
  {
    key: "name",
    label: "Name",
    validator: createLocationSchema.shape.name,
  },
];
