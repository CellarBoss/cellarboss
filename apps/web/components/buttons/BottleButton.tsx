import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { BottleWine } from "lucide-react";

type BottleButtonProps = {
  onClick: () => void;
};
export function BottleButton({ onClick }: BottleButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={onClick}
          className="cursor-pointer"
        >
          <BottleWine />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add bottle</TooltipContent>
    </Tooltip>
  );
}
