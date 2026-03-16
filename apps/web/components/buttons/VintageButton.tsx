import { Calendar } from "lucide-react";
import { IconButton } from "./IconButton";

type VintageButtonProps = {
  onClick: () => void;
};
export function VintageButton({ onClick }: VintageButtonProps) {
  return <IconButton icon={Calendar} tooltip="Add vintage" onClick={onClick} />;
}
