import { BottleWine } from "lucide-react";
import { IconButton } from "./IconButton";

type BottleButtonProps = {
  onClick: () => void;
};
export function BottleButton({ onClick }: BottleButtonProps) {
  return (
    <IconButton icon={BottleWine} tooltip="Add bottle" onClick={onClick} />
  );
}
