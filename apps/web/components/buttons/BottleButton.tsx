import { Button } from "@/components/ui/button";
import { BottleWine } from "lucide-react";

type BottleButtonProps = {
  onClick: () => void;
};
export function BottleButton({ onClick }: BottleButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      className="cursor-pointer"
      title="Add bottle"
    >
      <BottleWine />
    </Button>
  );
}
