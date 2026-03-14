export interface TastingNote {
  id: number;
  vintageId: number;
  date: string; // ISO 8601 datetime string, set server-side
  authorId: string; // FK to user.id, set server-side
  author: string; // resolved from user table via join (not a DB column)
  score: number; // integer 0–10
  notes: string;
}

// Frontend only sends vintageId, score, notes — authorId and date set server-side
export type CreateTastingNote = Pick<
  TastingNote,
  "vintageId" | "score" | "notes"
>;

// Only score and notes are editable after creation
export type UpdateTastingNote = Partial<Pick<TastingNote, "score" | "notes">>;
