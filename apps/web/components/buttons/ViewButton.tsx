import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Eye } from "lucide-react";

type ViewButtonProps = {
  onClick: () => Promise<void>;
};
export function ViewButton({ onClick }: ViewButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={onClick}
          className="cursor-pointer"
        >
          <Eye />
        </Button>
      </TooltipTrigger>
      <TooltipContent>View detail</TooltipContent>
    </Tooltip>
  );
}
