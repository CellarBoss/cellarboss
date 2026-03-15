import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Calendar } from "lucide-react";

type VintageButtonProps = {
  onClick: () => void;
};
export function VintageButton({ onClick }: VintageButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={onClick}
          className="cursor-pointer"
        >
          <Calendar />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add vintage</TooltipContent>
    </Tooltip>
  );
}
