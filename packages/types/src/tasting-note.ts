export interface TastingNote {
  id: number;
  vintageId: number;
  date: string; // ISO 8601 datetime string, set server-side
  author: string; // set from session user server-side
  score: number; // 0–10, decimals allowed
  notes: string;
}

// Frontend only sends vintageId, score, notes — author and date set server-side
export type CreateTastingNote = Pick<TastingNote, "vintageId" | "score" | "notes">;

// Only score and notes are editable after creation
export type UpdateTastingNote = Partial<Pick<TastingNote, "score" | "notes">>;
