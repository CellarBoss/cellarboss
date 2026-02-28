import Link from "next/link";
import type { TastingNote } from "@cellarboss/types";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Badge } from "@/components/ui/badge";
import { Barrel, Calendar, User } from "lucide-react";
import { formatDateTime } from "@/lib/functions/format";

function scoreColor(score: number): string {
  const hue = (score / 10) * 120;
  return `hsl(${hue}, 70%, 35%)`;
}

type TastingNoteCardProps = {
  note: TastingNote;
  datetimeFormat?: string;
  wineContext?: {
    wineName: string;
    winemakerName: string;
    vintageLabel: string;
    wineId: number;
    vintageId: number;
    wineMakerId: number;
  };
  vintageContext?: {
    label: string;
    vintageId: number;
  };
  onEdit?: () => Promise<void>;
  onDelete?: () => Promise<boolean>;
  deleteDescription?: string;
};

export function TastingNoteCard({
  note,
  datetimeFormat,
  wineContext,
  vintageContext,
  onEdit,
  onDelete,
  deleteDescription,
}: TastingNoteCardProps) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
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
        {vintageContext && (
          <>
            <span className="text-muted-foreground">·</span>
            <Badge variant="outline" asChild>
              <Link href={`/vintages/${vintageContext.vintageId}`}>
                <Calendar className="w-3 h-3" />
                {vintageContext.label}
              </Link>
            </Badge>
          </>
        )}
        {(onEdit || onDelete) && (
          <span className="ml-auto inline-flex items-center gap-1">
            {onEdit && <EditButton onEdit={onEdit} />}
            {onDelete && (
              <DeleteButton
                itemDescription={deleteDescription ?? `tasting note by ${note.author}`}
                onDelete={onDelete}
              />
            )}
          </span>
        )}
      </div>
      <div className="flex text-sm">
        {wineContext && (
          <>
            <div className="flex flex-col gap-1.5 px-4 py-3 shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <Barrel className="h-3.5 w-5 shrink-0" />
                <Link
                  href={`/wines/${wineContext.wineId}`}
                  className="font-semibold hover:underline"
                >
                  {wineContext.wineName}
                </Link>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-5 shrink-0" />
                <Link
                  href={`/vintages/${wineContext.vintageId}`}
                  className="hover:underline"
                >
                  {wineContext.vintageLabel}
                </Link>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-5 shrink-0" />
                <Link
                  href={`/winemakers/${wineContext.wineMakerId}`}
                  className="hover:underline"
                >
                  {wineContext.winemakerName}
                </Link>
              </span>
            </div>
            <div className="w-px self-stretch bg-border shrink-0" />
          </>
        )}
        <div className="px-4 py-3 whitespace-pre-wrap flex-1 min-w-0">
          {note.notes}
        </div>
      </div>
    </div>
  );
}
