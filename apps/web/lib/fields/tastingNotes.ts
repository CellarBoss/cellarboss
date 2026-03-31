import type { TastingNote } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";
import { tastingNoteFormValidators } from "@cellarboss/validators/tasting-notes.validator";

// Fields for creating a tasting note (vintageId pre-populated from URL, score + notes editable)
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

// Fields for editing a tasting note (vintageId, author, date are not editable)
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
