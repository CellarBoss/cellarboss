import { Eye } from "lucide-react";
import { IconButton } from "./IconButton";

type ViewButtonProps = {
  onClick: () => Promise<void>;
};
export function ViewButton({ onClick }: ViewButtonProps) {
  return <IconButton icon={Eye} tooltip="View detail" onClick={onClick} />;
}
