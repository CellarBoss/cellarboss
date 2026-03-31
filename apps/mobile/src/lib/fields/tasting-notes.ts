import type { FieldConfig } from "@/lib/types/field";
import type { TastingNote } from "@cellarboss/types";
import { tastingNoteFormValidators } from "@cellarboss/validators/tasting-notes.validator";

export const tastingNoteCreateFields: FieldConfig<TastingNote>[] = [
  {
    key: "vintageId",
    label: "Vintage",
    type: "wine-vintage",
    validator: tastingNoteFormValidators.vintageId,
  },
  {
    key: "score",
    label: "Score",
    type: "wine-rating",
    validator: tastingNoteFormValidators.score,
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
    validator: tastingNoteFormValidators.notes,
  },
];

export const tastingNoteEditFields: FieldConfig<TastingNote>[] = [
  {
    key: "score",
    label: "Score",
    type: "wine-rating",
    validator: tastingNoteFormValidators.score,
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
    validator: tastingNoteFormValidators.notes,
  },
];
