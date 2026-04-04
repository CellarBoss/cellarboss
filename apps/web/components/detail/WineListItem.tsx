import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Wine } from "@cellarboss/types";
import { WINE_TYPE_COLORS } from "@/lib/constants/wine-colouring";
import { formatWineType } from "@/lib/functions/format";

type WineListItemProps = {
  wine: Wine;
  secondaryText: string;
};

export function WineListItem({ wine, secondaryText }: WineListItemProps) {
  return (
    <Link
      href={`/wines/${wine.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <span
        className={`w-3 h-3 rounded-full shrink-0 ${WINE_TYPE_COLORS[wine.type]}`}
        title={formatWineType(wine.type)}
      />
      <span className="flex-1 min-w-0">
        <span className="text-sm font-medium block truncate">{wine.name}</span>
        <span className="text-xs text-muted-foreground block truncate">
          {secondaryText}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
