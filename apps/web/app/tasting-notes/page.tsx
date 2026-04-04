"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { TastingNote, Vintage, Wine, WineMaker } from "@cellarboss/types";
import { useApiQuery } from "@/hooks/use-api-query";
import { useSettingsContext } from "@/contexts/settings-context";
import { queryGate } from "@/lib/functions/query-gate";
import { getAllTastingNotes, deleteTastingNote } from "@/lib/api/tastingNotes";
import { getVintages } from "@/lib/api/vintages";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { AddButton } from "@/components/buttons/AddButton";
import { TastingNoteCard } from "@/components/tasting-notes/TastingNoteCard";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

const PAGE_SIZE = 20;

export default function TastingNotesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const notesQuery = useApiQuery<TastingNote[]>({
    queryKey: ["tastingNotes", "all"],
    queryFn: getAllTastingNotes,
  });

  const vintagesQuery = useApiQuery<Vintage[]>({
    queryKey: ["vintages"],
    queryFn: getVintages,
  });

  const winesQuery = useApiQuery<Wine[]>({
    queryKey: ["wines"],
    queryFn: getWines,
  });

  const winemakersQuery = useApiQuery<WineMaker[]>({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  });

  const settings = useSettingsContext();

  const result = queryGate([
    notesQuery,
    vintagesQuery,
    winesQuery,
    winemakersQuery,
  ]);
  if (!result.ready) return result.gate;

  const [notes, vintages, wines, winemakers] = result.data;
  const datetimeFormat = settings.get("datetime") as string | undefined;

  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm]));

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <TastingNotesPageContent
      notes={sortedNotes}
      datetimeFormat={datetimeFormat}
      vintageMap={vintageMap}
      wineMap={wineMap}
      winemakerMap={winemakerMap}
      onEdit={async (noteId) => {
        router.push(`/tasting-notes/${noteId}/edit`);
      }}
      onDelete={async (noteId) => {
        const result = await deleteTastingNote(noteId);
        if (!result.ok) throw new Error(result.error.message);
        queryClient.invalidateQueries({ queryKey: ["tastingNotes", "all"] });
        return true;
      }}
      onAdd={async () => {
        router.push("/tasting-notes/new");
      }}
    />
  );
}

type TastingNotesPageContentProps = {
  notes: TastingNote[];
  datetimeFormat?: string;
  vintageMap: Map<number, Vintage>;
  wineMap: Map<number, Wine>;
  winemakerMap: Map<number, WineMaker>;
  onEdit: (noteId: number) => Promise<void>;
  onDelete: (noteId: number) => Promise<boolean>;
  onAdd: () => Promise<void>;
};

function TastingNotesPageContent({
  notes,
  datetimeFormat,
  vintageMap,
  wineMap,
  winemakerMap,
  onEdit,
  onDelete,
  onAdd,
}: TastingNotesPageContentProps) {
  const { visibleItems, sentinelRef, hasMore } = useInfiniteScroll(
    notes,
    PAGE_SIZE,
  );

  function getWineContext(note: TastingNote) {
    const vintage = vintageMap.get(note.vintageId);
    if (!vintage) return undefined;
    const wine = wineMap.get(vintage.wineId);
    if (!wine) return undefined;
    const winemaker = winemakerMap.get(wine.wineMakerId);
    return {
      wineName: wine.name,
      winemakerName: winemaker?.name ?? "Unknown",
      vintageLabel: vintage.year ? String(vintage.year) : "NV",
      wineId: wine.id,
      vintageId: vintage.id,
      wineMakerId: wine.wineMakerId,
    };
  }

  return (
    <section>
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Tasting Notes</h1>
        <div className="ml-auto">
          <AddButton onClick={onAdd} subject="Tasting Note" />
        </div>
      </div>
      {notes.length === 0 ? (
        <p className="text-muted-foreground italic">No tasting notes yet.</p>
      ) : (
        <div className="flex flex-col gap-2 divide-y">
          {visibleItems.map((note) => (
            <TastingNoteCard
              key={note.id}
              note={note}
              datetimeFormat={datetimeFormat}
              wineContext={getWineContext(note)}
              onEdit={async () => {
                await onEdit(note.id);
              }}
              onDelete={() => onDelete(note.id)}
              deleteDescription={`tasting note by ${note.author}`}
            />
          ))}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="h-10 flex items-center justify-center"
            >
              <span className="text-muted-foreground text-sm">
                Loading more...
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
