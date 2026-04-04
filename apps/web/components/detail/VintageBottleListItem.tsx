import Link from "next/link";
import { Calendar, ChevronRight, MapPin, Warehouse } from "lucide-react";
import type { Bottle } from "@cellarboss/types";
import type { BottleSize, WineType } from "@cellarboss/validators/constants";
import { Badge } from "@/components/ui/badge";
import { BottleSizeIcon } from "@/components/bottles/BottleSizeIcon";
import {
  formatStatus,
  formatBottleSize,
  formatDate,
} from "@/lib/functions/format";

type VintageBottleListItemProps = {
  bottle: Bottle;
  wineType?: WineType;
  locationName?: string;
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

export function VintageBottleListItem({
  bottle,
  wineType,
  locationName,
  storagePath,
}: VintageBottleListItemProps) {
  return (
    <Link
      href={`/bottles/${bottle.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      {wineType ? (
        <BottleSizeIcon size={bottle.size as BottleSize} wineType={wineType} />
      ) : (
        <span className="w-10 h-10" />
      )}
      <span className="flex-1 min-w-0 space-y-0.5">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {formatDate(bottle.purchaseDate, "dd/MM/yyyy")}
          </span>
        </span>
        {locationName && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{locationName}</span>
          </span>
        )}
        {storagePath && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Warehouse className="h-3 w-3 shrink-0" />
            <span className="truncate">{storagePath}</span>
          </span>
        )}
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
