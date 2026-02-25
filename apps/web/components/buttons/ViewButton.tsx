import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

type ViewButtonProps = {
  onClick: () => Promise<void>;
};
export function ViewButton({ onClick }: ViewButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      className="cursor-pointer"
      title="View detail"
    >
      <Eye />
    </Button>
  );
}