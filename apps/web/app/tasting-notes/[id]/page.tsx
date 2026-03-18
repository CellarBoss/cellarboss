"use client";

import { skipToken } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";
import { getTastingNoteById, deleteTastingNote } from "@/lib/api/tastingNotes";
import { getVintageById } from "@/lib/api/vintages";
import { getWineById } from "@/lib/api/wines";
import { getWinemakerById } from "@/lib/api/winemakers";
import { TastingNoteCard } from "@/components/tasting-notes/TastingNoteCard";
import { useSettingsContext } from "@/contexts/settings-context";
import { BackButton } from "@/components/buttons/BackButton";
import { PageHeader } from "@/components/page/PageHeader";

export default function ViewTastingNotePage() {
  const params = useParams();
  const router = useRouter();
  const tastingNoteId = params.id;

  const tastingNoteQuery = useApiQuery({
    queryKey: ["tasting-note", tastingNoteId],
    queryFn: () => getTastingNoteById(Number(tastingNoteId)),
    enabled: !!tastingNoteId,
  });
  const settings = useSettingsContext();

  const vintageId = tastingNoteQuery.data?.vintageId;
  const vintageQuery = useApiQuery({
    queryKey: ["vintage", vintageId],
    queryFn: vintageId ? () => getVintageById(vintageId) : skipToken,
  });

  const wineId = vintageQuery.data?.wineId;
  const wineQuery = useApiQuery({
    queryKey: ["wine", wineId],
    queryFn: wineId ? () => getWineById(wineId) : skipToken,
  });

  const wineMakerId = wineQuery.data?.wineMakerId;
  const winemakerQuery = useApiQuery({
    queryKey: ["winemaker", wineMakerId],
    queryFn: wineMakerId ? () => getWinemakerById(wineMakerId) : skipToken,
  });

  const result = queryGate(
    tastingNoteQuery,
    vintageQuery,
    wineQuery,
    winemakerQuery,
  );
  if (!result.ready) return result.gate;

  const [note, vintage, wine, winemaker] = result.data;
  const datetimeFormat = settings.get("datetime") as string | undefined;

  return (
    <section>
      <PageHeader title={`Tasting Note`} />
      <TastingNoteCard
        key={note.id}
        note={note}
        datetimeFormat={datetimeFormat}
        wineContext={{
          wineName: wine.name,
          winemakerName: winemaker.name,
          vintageLabel: vintage.year ? String(vintage.year) : "NV",
          wineId: wine.id,
          vintageId: vintage.id,
          wineMakerId: wine.wineMakerId,
        }}
        onEdit={async () => {
          router.push(`/tasting-notes/${note.id}/edit`);
        }}
        onDelete={async () => {
          const result = await deleteTastingNote(note.id);
          if (!result.ok) throw new Error(result.error.message);
          router.push("/tasting-notes");
          return true;
        }}
        deleteDescription={`tasting note by ${note.author}`}
      />
      <span className="flex items-center gap-4 mt-4">
        <BackButton />
      </span>
    </section>
  );
}
