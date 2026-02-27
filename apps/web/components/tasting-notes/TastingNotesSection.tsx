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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type TastingNotesSectionProps =
  | { vintageId: number; wineId?: never; vintages?: never }
  | { wineId: number; vintages: Vintage[]; vintageId?: never };

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TastingNotesSection(props: TastingNotesSectionProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

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

  function getVintageId(note: TastingNote): number {
    return note.vintageId;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Tasting Notes</h2>
        {isVintageMode && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              router.push(`/tasting-notes/new?vintageId=${props.vintageId}`)
            }
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {notesQuery.isLoading ? (
        <p className="text-muted-foreground italic">Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-muted-foreground italic">No tasting notes yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              {!isVintageMode && (
                <th className="text-left font-medium py-2 pr-4">Vintage</th>
              )}
              <th className="text-left font-medium py-2 pr-4">Date</th>
              <th className="text-left font-medium py-2 pr-4">Author</th>
              <th className="text-left font-medium py-2 pr-4">Score</th>
              <th className="text-left font-medium py-2 pr-4">Notes</th>
              <th className="text-right font-medium py-2"></th>
            </tr>
          </thead>
          <tbody>
            {[...notes]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((note) => (
                <tr key={note.id} className="border-t border-border/50">
                  {!isVintageMode && (
                    <td className="py-2 pr-4">
                      <Link
                        href={`/vintages/${getVintageId(note)}`}
                        className="hover:underline"
                      >
                        {getVintageLabel(note.vintageId)}
                      </Link>
                    </td>
                  )}
                  <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(note.date)}
                  </td>
                  <td className="py-2 pr-4">{note.author}</td>
                  <td className="py-2 pr-4 font-medium">{note.score}</td>
                  <td className="py-2 pr-4 text-muted-foreground max-w-xs truncate">
                    {note.notes}
                  </td>
                  <td className="py-2 text-right">
                    <span className="inline-flex items-center gap-1">
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
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
