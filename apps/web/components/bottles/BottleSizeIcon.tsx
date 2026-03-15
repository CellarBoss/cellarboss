import { BottleWine } from "lucide-react";
import type { WineType } from "@cellarboss/validators/constants";
import { BOTTLE_SIZES } from "@/lib/constants/bottle-sizes";
import { WINE_TYPE_COLORS } from "@/lib/constants/wine-colouring";
import { formatBottleSize } from "@/lib/functions/format";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function BottleSizeIcon({
  size,
  wineType,
}: {
  size: string;
  wineType: WineType;
}) {
  const iconSize = BOTTLE_SIZES[size]?.iconSize ?? 16;
  const colorClass = WINE_TYPE_COLORS[wineType].replace("bg-", "text-");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center justify-center w-10 h-10">
          <BottleWine className={colorClass} size={iconSize} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{formatBottleSize(size)}</TooltipContent>
    </Tooltip>
  );
}
