import { BottleWine } from "lucide-react";
import type { WineType } from "@cellarboss/validators/constants";
import { WINE_TYPE_COLORS } from "@/lib/constants/wine-colouring";
import { formatBottleSize } from "@/lib/functions/format";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BOTTLE_SIZE_ICON_SIZES: Record<string, number> = {
  piccolo: 20,
  half: 22,
  standard: 24,
  litre: 26,
  magnum: 28,
  "double-magnum": 30,
  jeroboam: 32,
  imperial: 34,
  salmanazar: 36,
  balthazar: 38,
  nebuchadnezzar: 40,
};

export function BottleSizeIcon({
  size,
  wineType,
}: {
  size: string;
  wineType: WineType;
}) {
  const iconSize = BOTTLE_SIZE_ICON_SIZES[size] ?? 16;
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
