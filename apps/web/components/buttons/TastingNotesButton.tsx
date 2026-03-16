import { useApiQuery } from "@/hooks/use-api-query";
import {
  getTastingNotesByVintageId,
  getTastingNotesByWineId,
} from "@/lib/api/tastingNotes";
import { NotebookPen } from "lucide-react";
import { IconButton } from "./IconButton";

type TastingNotesButtonProps = {
  count?: number;
  onClick: () => void;
};

export function WineTastingNotesButton({ wineId }: { wineId: number }) {
  const wineNotesQuery = useApiQuery({
    queryKey: ["tastingNotes", "wine", wineId],
    queryFn: () => getTastingNotesByWineId(wineId!),
    enabled: !!wineId,
  });

  const count = wineNotesQuery.data?.length || 0;

  return (
    <TastingNotesButton
      count={count}
      onClick={() => (window.location.href = `/wines/${wineId}#tasting-notes`)}
    />
  );
}

export function VintageTastingNotesButton({
  vintageId,
}: {
  vintageId: number;
}) {
  const vintageNotesQuery = useApiQuery({
    queryKey: ["tastingNotes", "vintage", vintageId],
    queryFn: () => getTastingNotesByVintageId(vintageId!),
    enabled: !!vintageId,
  });

  const count = vintageNotesQuery.data?.length || 0;

  return (
    <TastingNotesButton
      count={count}
      onClick={() =>
        (window.location.href = `/vintages/${vintageId}#tasting-notes`)
      }
    />
  );
}

export function TastingNotesButton({
  count,
  onClick,
}: TastingNotesButtonProps) {
  return (
    <IconButton
      icon={NotebookPen}
      tooltip="View Tasting Notes"
      onClick={onClick}
    >
      {count ? `${count}` : "0"}
    </IconButton>
  );
}
