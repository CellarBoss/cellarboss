import { Button } from "@/components/ui/button";
import { Pencil} from "lucide-react"

type EditButtonProps = {
  onEdit: () => Promise<void>;
}
export function EditButton({ onEdit }: EditButtonProps) {
  return (
    <Button size="sm" variant="outline" onClick={onEdit} className="cursor-pointer">
      <Pencil />
    </Button>
  )
}