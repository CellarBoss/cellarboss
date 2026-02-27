import * as z from "zod";
import type { TastingNote } from "@cellarboss/types";
import type { FieldConfig } from "@/lib/types/field";

// Fields for creating a tasting note (vintageId pre-populated from URL, score + notes editable)
export const tastingNoteCreateFields: FieldConfig<TastingNote>[] = [
  {
    key: "vintageId",
    label: "Vintage",
    type: "wine-vintage",
    validator: z.coerce.number().int().positive(),
  },
  {
    key: "score",
    label: "Score",
    type: "wine-rating",
    validator: z.coerce.number().int().min(0).max(10),
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
    validator: z.string(),
  },
];

// Fields for editing a tasting note (vintageId, author, date are not editable)
export const tastingNoteEditFields: FieldConfig<TastingNote>[] = [
  {
    key: "score",
    label: "Score",
    type: "wine-rating",
    validator: z.coerce.number().int().min(0).max(10),
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
    validator: z.string(),
  },
];
