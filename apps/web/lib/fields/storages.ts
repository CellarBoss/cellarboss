import type { Storage } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { storageFormValidators } from "@cellarboss/validators/storages.validator";
import { getLocations } from "@/lib/api/locations";
import { getStorages } from "@/lib/api/storages";

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
      queryFn: getLocations,
    },
    validator: storageFormValidators.locationId,
  },
  {
    key: "parent",
    label: "Parent Storage",
    type: "selector",
    selectorConfig: {
      queryKey: "storages",
      queryFn: getStorages,
      hierarchical: true,
    },
    validator: storageFormValidators.parent,
  },
];
