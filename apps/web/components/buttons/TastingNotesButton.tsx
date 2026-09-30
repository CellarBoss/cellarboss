import { useRouter } from "next/navigation";
import { NotebookPen } from "lucide-react";
import { IconButton } from "./IconButton";

type TastingNotesButtonProps = {
  count?: number;
  onClick: () => void;
};

export function WineTastingNotesButton({
  wineId,
  count,
}: {
  wineId: number;
  count: number;
}) {
  const router = useRouter();

  return (
    <TastingNotesButton
      count={count}
      onClick={() => router.push(`/wines/${wineId}#tasting-notes`)}
    />
  );
}

export function VintageTastingNotesButton({
  vintageId,
  count,
}: {
  vintageId: number;
  count: number;
}) {
  const router = useRouter();

  return (
    <TastingNotesButton
      count={count}
      onClick={() => router.push(`/vintages/${vintageId}#tasting-notes`)}
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
