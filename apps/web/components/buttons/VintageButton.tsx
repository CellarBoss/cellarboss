import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react"

type VintageButtonProps = {
  onClick: () => void;
}
export function VintageButton({ onClick }: VintageButtonProps) {
  return (
    <Button size="sm" variant="outline" onClick={onClick} className="cursor-pointer" title="Add vintage">
      <Calendar />
    </Button>
  )
}