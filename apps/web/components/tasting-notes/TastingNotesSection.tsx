"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { TastingNote, Vintage } from "@cellarboss/types";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  getTastingNotesByVintageId,
  getTastingNotesByWineId,
  deleteTastingNote,
} from "@/lib/api/tastingNotes";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSettingsContext } from "@/contexts/settings-context";
import { TastingNoteCard } from "./TastingNoteCard";

type TastingNotesSectionProps =
  | { vintageId: number; wineId?: never; vintages?: never }
  | { wineId: number; vintages: Vintage[]; vintageId?: never };

export function TastingNotesSection(props: TastingNotesSectionProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const datetimeFormat = useSettingsContext().get("datetime") as
    | string
    | undefined;

  const isVintageMode = props.vintageId !== undefined;

  const notesQuery = useApiQuery<TastingNote[]>({
    queryKey: isVintageMode
      ? ["tastingNotes", "vintage", props.vintageId]
      : ["tastingNotes", "wine", props.wineId],
    queryFn: isVintageMode
      ? () => getTastingNotesByVintageId(props.vintageId!)
      : () => getTastingNotesByWineId(props.wineId!),
  });

  const notes = notesQuery.data ?? [];

  function getVintageLabel(vintageId: number): string {
    if (!props.vintages) return String(vintageId);
    const vintage = props.vintages.find((v) => v.id === vintageId);
    return vintage
      ? vintage.year
        ? String(vintage.year)
        : "NV"
      : String(vintageId);
  }

  function invalidateNotes() {
    queryClient.invalidateQueries({
      queryKey: isVintageMode
        ? ["tastingNotes", "vintage", props.vintageId]
        : ["tastingNotes", "wine", props.wineId],
    });
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Tasting Notes</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            router.push(
              isVintageMode
                ? `/tasting-notes/new?vintageId=${props.vintageId}`
                : `/tasting-notes/new?wineId=${props.wineId}`,
            )
          }
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Note
        </Button>
      </div>

      {notesQuery.isLoading ? (
        <p className="text-muted-foreground italic">Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-muted-foreground italic">No tasting notes yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {[...notes]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map((note) => (
              <TastingNoteCard
                key={note.id}
                note={note}
                datetimeFormat={datetimeFormat}
                vintageContext={
                  !isVintageMode
                    ? {
                        label: getVintageLabel(note.vintageId),
                        vintageId: note.vintageId,
                      }
                    : undefined
                }
                onEdit={async () => {
                  router.push(`/tasting-notes/${note.id}/edit`);
                }}
                onDelete={async () => {
                  const result = await deleteTastingNote(note.id);
                  if (!result.ok) throw new Error(result.error.message);
                  invalidateNotes();
                  return true;
                }}
                deleteDescription={`tasting note by ${note.author}`}
              />
            ))}
        </div>
      )}
    </div>
  );
}
