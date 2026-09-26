import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

type SaveButtonProps = {
  isProcessing: boolean;
};
export function SaveButton({ isProcessing }: SaveButtonProps) {
  return (
    <Button
      size="lg"
      variant="outline"
      disabled={isProcessing}
      type="submit"
      className="cursor-pointer"
    >
      <Save />
      {isProcessing ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </span>
      ) : (
        "Save"
      )}
    </Button>
  );
}
