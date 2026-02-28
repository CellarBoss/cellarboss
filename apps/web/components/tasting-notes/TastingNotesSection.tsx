"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { TastingNote, Vintage } from "@cellarboss/types";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  getTastingNotesByVintageId,
  getTastingNotesByWineId,
  deleteTastingNote,
} from "@/lib/api/tastingNotes";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { useSetting } from "@/hooks/use-settings";
import { formatDateTime } from "@/lib/functions/format";

function scoreColor(score: number): string {
  const hue = (score / 10) * 120;
  return `hsl(${hue}, 70%, 35%)`;
}

type TastingNotesSectionProps =
  | { vintageId: number; wineId?: never; vintages?: never }
  | { wineId: number; vintages: Vintage[]; vintageId?: never };

export function TastingNotesSection(props: TastingNotesSectionProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const datetimeFormat = useSetting("datetime").data as string | undefined;

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
              <div
                key={note.id}
                className="rounded-md border border-border overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border text-sm">
                  <span className="font-semibold">{note.author}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-xs">
                    {datetimeFormat
                      ? formatDateTime(note.date, datetimeFormat)
                      : note.date}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <Badge
                    style={{
                      backgroundColor: scoreColor(note.score),
                      color: "white",
                    }}
                  >
                    {note.score}/10
                  </Badge>
                  {!isVintageMode && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <Badge variant="outline" asChild>
                        <Link href={`/vintages/${note.vintageId}`}>
                          <Calendar />
                          {getVintageLabel(note.vintageId)}
                        </Link>
                      </Badge>
                    </>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1">
                    <EditButton
                      onEdit={async () =>
                        router.push(`/tasting-notes/${note.id}/edit`)
                      }
                    />
                    <DeleteButton
                      itemDescription={`tasting note by ${note.author}`}
                      onDelete={async () => {
                        const result = await deleteTastingNote(note.id);
                        if (!result.ok) throw new Error(result.error.message);
                        queryClient.invalidateQueries({
                          queryKey: isVintageMode
                            ? ["tastingNotes", "vintage", props.vintageId]
                            : ["tastingNotes", "wine", props.wineId],
                        });
                        return true;
                      }}
                    />
                  </span>
                </div>
                <div className="px-4 py-3 text-sm whitespace-pre-wrap">
                  {note.notes}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
