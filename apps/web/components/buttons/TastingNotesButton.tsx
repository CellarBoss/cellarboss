import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  getTastingNotesByVintageId,
  getTastingNotesByWineId,
} from "@/lib/api/tastingNotes";
import { NotebookPen } from "lucide-react";

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={onClick}
          className="cursor-pointer"
        >
          <NotebookPen /> {count ? `${count}` : "0"}
        </Button>
      </TooltipTrigger>
      <TooltipContent>View Tasting Notes</TooltipContent>
    </Tooltip>
  );
}
