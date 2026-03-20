import type { FieldConfig } from "@/lib/types/field";
import type { TastingNote } from "@cellarboss/types";

export const tastingNoteCreateFields: FieldConfig<TastingNote>[] = [
  {
    key: "vintageId",
    label: "Vintage",
    type: "wine-vintage",
  },
  {
    key: "score",
    label: "Score",
    type: "wine-rating",
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export const tastingNoteEditFields: FieldConfig<TastingNote>[] = [
  {
    key: "score",
    label: "Score",
    type: "wine-rating",
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
  },
];
