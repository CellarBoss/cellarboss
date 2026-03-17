"use client";

import { useParams } from "next/navigation";
import type { TastingNote, UpdateTastingNote } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import type { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { getTastingNoteById, updateTastingNote } from "@/lib/api/tastingNotes";
import { tastingNoteEditFields } from "@/lib/fields/tastingNotes";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

async function handleUpdate(
  note: TastingNote,
): Promise<ApiResult<TastingNote>> {
  const data: UpdateTastingNote = {
    score: Number(note.score),
    notes: note.notes,
  };
  return updateTastingNote(note.id, data);
}

export default function EditTastingNotePage() {
  const params = useParams();
  const noteId = Number(params.id);

  const noteQuery = useApiQuery({
    queryKey: ["tastingNote", noteId],
    queryFn: () => getTastingNoteById(noteId),
    enabled: !!noteId,
  });

  const result = queryGate([noteQuery]);
  if (!result.ready) return result.gate;

  const [note] = result.data;

  return (
    <section>
      <PageHeader title="Edit Tasting Note" />
      <GenericCard<TastingNote>
        mode="edit"
        data={note}
        fields={tastingNoteEditFields}
        processSave={handleUpdate}
        redirectTo={`/vintages/${note.vintageId}`}
      />
    </section>
  );
}
