import { Button } from "@/components/ui/button";
import { PencilOff } from "lucide-react";

type ResetButtonProps = {
  isProcessing: boolean;
  form: { reset: () => void };
};
export function ResetButton({ isProcessing, form }: ResetButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      disabled={isProcessing}
      onClick={() => form.reset()}
      className="cursor-pointer"
    >
      <PencilOff />
      Reset
    </Button>
  );
}
