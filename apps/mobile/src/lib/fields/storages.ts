import { api } from "@/lib/api/client";
import type { FieldConfig } from "@/lib/types/field";
import type { Storage } from "@cellarboss/types";

export const storageFields: FieldConfig<Storage>[] = [
  {
    key: "name",
    label: "Name",
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
  },
];
