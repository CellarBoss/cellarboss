import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Bottle } from "@cellarboss/types";
import type { WineType } from "@cellarboss/validators/constants";
import { Badge } from "@/components/ui/badge";
import { WINE_TYPE_COLORS } from "@/lib/constants/wine-colouring";
import { formatStatus, formatBottleSize } from "@/lib/functions/format";

type BottleListItemProps = {
  bottle: Bottle;
  wineName: string;
  wineYear: string;
  winemakerName: string;
  wineType?: WineType;
  drinkingStatus: string;
  storagePath?: string;
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  stored: "default",
  ordered: "secondary",
  "in-primeur": "secondary",
  drunk: "outline",
  sold: "outline",
  gifted: "outline",
};

export function BottleListItem({
  bottle,
  wineName,
  wineYear,
  winemakerName,
  wineType,
  drinkingStatus,
  storagePath,
}: BottleListItemProps) {
  return (
    <Link
      href={`/bottles/${bottle.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      {wineType && (
        <span
          className={`w-3 h-3 rounded-full shrink-0 ${WINE_TYPE_COLORS[wineType]}`}
        />
      )}
      <span className="flex-1 min-w-0">
        <span className="text-sm font-medium block truncate">
          {wineName} {wineYear}
        </span>
        <span className="text-xs text-muted-foreground block truncate">
          {[winemakerName, formatBottleSize(bottle.size), storagePath]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
      <Badge
        variant={STATUS_VARIANT[bottle.status] ?? "outline"}
        className="shrink-0"
      >
        {formatStatus(bottle.status)}
      </Badge>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
