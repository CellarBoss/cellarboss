"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateVintageCounts } from "@/lib/functions/invalidate-vintage-counts";
import type { TastingNote, Vintage } from "@cellarboss/types";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  getTastingNotesByVintageId,
  getTastingNotesByWineId,
  deleteTastingNote,
} from "@/lib/api/tastingNotes";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettingsContext } from "@/contexts/settings-context";
import { TastingNoteCard } from "./TastingNoteCard";

const PAGE_SIZE = 10;

type TastingNotesSectionProps = (
  | { vintage: Vintage; wineId?: never; vintages?: never }
  | { wineId: number; vintages: Vintage[]; vintage?: never }
) & { className?: string };

export function TastingNotesSection({
  className = "mt-6",
  ...props
}: TastingNotesSectionProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const datetimeFormat = useSettingsContext().get("datetime") as
    string | undefined;

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const isVintageMode = props.vintage !== undefined;
  const vintageId = props.vintage?.id;

  const notesQuery = useApiQuery<TastingNote[]>({
    queryKey: isVintageMode
      ? ["tastingNotes", "vintage", vintageId]
      : ["tastingNotes", "wine", props.wineId],
    queryFn: isVintageMode
      ? () => getTastingNotesByVintageId(vintageId!)
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

  function invalidateNotes(note: TastingNote) {
    queryClient.invalidateQueries({
      queryKey: isVintageMode
        ? ["tastingNotes", "vintage", vintageId]
        : ["tastingNotes", "wine", props.wineId],
    });
    invalidateVintageCounts(
      queryClient,
      props.vintage ?? { id: note.vintageId, wineId: props.wineId! },
    );
  }

  const addHref = isVintageMode
    ? `/tasting-notes/new?vintageId=${vintageId}`
    : `/tasting-notes/new?wineId=${props.wineId}`;

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Tasting Notes
          {!notesQuery.isLoading && (
            <span className="ml-1">({notes.length})</span>
          )}
        </h2>
        <Link
          href={addHref}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add note
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          {notesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground px-4 py-3">
              Loading...
            </p>
          ) : sortedNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground px-4 py-3">
              No tasting notes yet.
            </p>
          ) : (
            <>
              <div className="divide-y">
                {sortedNotes.slice(0, visibleCount).map((note) => (
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
                      invalidateNotes(note);
                      return true;
                    }}
                    deleteDescription={`tasting note by ${note.author}`}
                  />
                ))}
              </div>
              {visibleCount < sortedNotes.length && (
                <div className="px-4 py-2 text-center border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    View more ({sortedNotes.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
