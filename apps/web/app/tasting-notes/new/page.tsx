"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { TastingNote, CreateTastingNote } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { tastingNoteCreateFields } from "@/lib/fields/tastingNotes";
import { createTastingNote } from "@/lib/api/tastingNotes";
import type { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";

async function handleCreate(
  data: TastingNote,
): Promise<ApiResult<TastingNote>> {
  const noteData: CreateTastingNote = {
    vintageId: Number(data.vintageId),
    score: Number(data.score),
    notes: data.notes,
  };
  return createTastingNote(noteData);
}

function NewTastingNoteForm() {
  const searchParams = useSearchParams();
  const vintageId = searchParams.get("vintageId");
  const wineId = searchParams.get("wineId");

  const defaultData: TastingNote = {
    id: 0,
    vintageId: vintageId ? Number(vintageId) : 0,
    date: "",
    authorId: "",
    author: "",
    score: 0,
    notes: "",
  };

  const redirectTo = vintageId
    ? `/vintages/${vintageId}`
    : wineId
      ? `/wines/${wineId}`
      : "/tasting-notes";

  return (
    <GenericCard<TastingNote>
      mode="create"
      data={defaultData}
      fields={tastingNoteCreateFields}
      processSave={handleCreate}
      redirectTo={redirectTo}
    />
  );
}

export default function NewTastingNotePage() {
  return (
    <section>
      <PageHeader title="New Tasting Note" />
      <Suspense>
        <NewTastingNoteForm />
      </Suspense>
    </section>
  );
}
