import { Pencil } from "lucide-react";
import { IconButton } from "./IconButton";

type EditButtonProps = {
  onEdit: () => Promise<void>;
};
export function EditButton({ onEdit }: EditButtonProps) {
  return <IconButton icon={Pencil} tooltip="Edit" onClick={onEdit} />;
}
