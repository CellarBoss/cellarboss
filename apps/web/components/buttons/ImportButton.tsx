import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type ImportButtonProps = {
  onClick: () => Promise<void>;
};
export function ImportButton({ onClick }: ImportButtonProps) {
  return (
    <Button
      size="lg"
      variant="outline"
      onClick={onClick}
      className="cursor-pointer"
    >
      <Download /> Import from link
    </Button>
  );
}
