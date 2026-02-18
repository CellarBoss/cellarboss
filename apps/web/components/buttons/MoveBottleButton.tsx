import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoveRight, Loader2 } from "lucide-react";
import HierarchicalSingleSelector from "@/components/selector/HierarchicalSingleSelector";
import type { Storage } from "@cellarboss/types";

type MoveBottleButtonProps = {
  storages: Storage[];
  currentStorageId: number | null;
  onMove: (newStorageId: number | null) => Promise<void>;
};

export function MoveBottleButton({ storages, currentStorageId, onMove }: MoveBottleButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(currentStorageId?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setSelectedValue(currentStorageId?.toString() ?? "");
      setError(null);
    }
    setOpen(next);
  };

  const mockField = {
    state: { value: selectedValue },
    handleChange: setSelectedValue,
  };

  const handleMove = async () => {
    setLoading(true);
    setError(null);
    try {
      const newStorageId = selectedValue ? Number(selectedValue) : null;
      await onMove(newStorageId);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="cursor-pointer">
          <MoveRight />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Bottle</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <HierarchicalSingleSelector
            options={storages}
            isInvalid={false}
            editable={true}
            field={mockField}
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={loading} className="flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
