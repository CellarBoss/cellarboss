import Link from "next/link";
import type { TastingNote } from "@cellarboss/types";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Barrel, Calendar, User } from "lucide-react";
import { formatDateTime } from "@/lib/functions/format";
import { scoreColor } from "@cellarboss/common";

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
  standalone?: boolean;
};

export function TastingNoteCard({
  note,
  datetimeFormat,
  wineContext,
  vintageContext,
  onEdit,
  onDelete,
  deleteDescription,
  standalone = false,
}: TastingNoteCardProps) {
  const content = (
    <>
      <div className="flex items-center gap-2 text-sm">
        <Badge
          style={{
            backgroundColor: scoreColor(note.score),
            color: "white",
          }}
        >
          {note.score}/10
        </Badge>
        <span className="font-medium">{note.author}</span>
        <span className="text-muted-foreground text-xs">
          {datetimeFormat
            ? formatDateTime(note.date, datetimeFormat)
            : note.date}
        </span>
        {vintageContext && (
          <Badge variant="outline" asChild>
            <Link href={`/vintages/${vintageContext.vintageId}`}>
              <Calendar className="w-3 h-3" />
              {vintageContext.label}
            </Link>
          </Badge>
        )}
        {(onEdit || onDelete) && (
          <span className="ml-auto inline-flex items-center gap-1">
            {onEdit && <EditButton onEdit={onEdit} />}
            {onDelete && (
              <DeleteButton
                itemDescription={
                  deleteDescription ?? `tasting note by ${note.author}`
                }
                onDelete={onDelete}
              />
            )}
          </span>
        )}
      </div>
      {wineContext && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span className="inline-flex items-center gap-1.5">
            <Barrel className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/wines/${wineContext.wineId}`}
              className="hover:underline text-primary"
            >
              {wineContext.wineName}
            </Link>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/vintages/${wineContext.vintageId}`}
              className="hover:underline text-primary"
            >
              {wineContext.vintageLabel}
            </Link>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/winemakers/${wineContext.wineMakerId}`}
              className="hover:underline text-primary"
            >
              {wineContext.winemakerName}
            </Link>
          </span>
        </div>
      )}
      {note.notes && (
        <p className="text-sm whitespace-pre-wrap mt-2">{note.notes}</p>
      )}
    </>
  );

  if (standalone) {
    return (
      <Card>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className="px-4 py-3">{content}</div>;
}
