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
import { Tag, Loader2 } from "lucide-react";
import { IconButton } from "./IconButton";
import { FixedListField } from "@/components/cards/FixedListField";
import { BOTTLE_STATUSES } from "@cellarboss/validators/constants";
import type { Bottle } from "@cellarboss/types";
import { formatStatus } from "@/lib/functions/format";

type BottleStatus = Bottle["status"];

type ChangeStatusButtonProps = {
  currentStatus: BottleStatus;
  onChangeStatus: (newStatus: BottleStatus) => Promise<void>;
};

export function ChangeStatusButton({
  currentStatus,
  onChangeStatus,
}: ChangeStatusButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<BottleStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setSelectedStatus(currentStatus);
      setError(null);
    }
    setOpen(next);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await onChangeStatus(selectedStatus);
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <IconButton icon={Tag} tooltip="Change status" trigger={DialogTrigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <FixedListField
            field={{
              state: { value: selectedStatus },
              handleChange: (v: string) => setSelectedStatus(v as BottleStatus),
            }}
            editable={true}
            options={BOTTLE_STATUSES.map((s) => ({
              value: s,
              label: formatStatus(s),
            }))}
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
