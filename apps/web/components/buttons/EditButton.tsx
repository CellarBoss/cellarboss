import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";

type EditButtonProps = {
  onEdit: () => Promise<void>;
};
export function EditButton({ onEdit }: EditButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="cursor-pointer"
        >
          <Pencil />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Edit</TooltipContent>
    </Tooltip>
  );
}
