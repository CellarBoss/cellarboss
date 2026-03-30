import { api } from "@/lib/api/client";
import type { FieldConfig } from "@/lib/types/field";
import type { Storage } from "@cellarboss/types";
import { storageFormValidators } from "@cellarboss/validators/storages.validator";

export const storageFields: FieldConfig<Storage>[] = [
  {
    key: "name",
    label: "Name",
    validator: storageFormValidators.name,
  },
  {
    key: "locationId",
    label: "Location",
    type: "selector",
    selectorConfig: {
      queryKey: "locations",
      queryFn: () => api.locations.getAll(),
      allowNone: true,
    },
    validator: storageFormValidators.locationId,
  },
  {
    key: "parent",
    label: "Parent Storage",
    type: "selector",
    selectorConfig: {
      queryKey: "storages",
      queryFn: () => api.storages.getAll(),
      allowNone: true,
    },
    validator: storageFormValidators.parent,
  },
];
