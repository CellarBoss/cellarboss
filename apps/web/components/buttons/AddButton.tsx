import { Button } from "@/components/ui/button";
import { Plus} from "lucide-react"

type AddButtonProps = {
  onClick: () => Promise<void>;
  subject?: string;
}
export function AddButton({ onClick, subject }: AddButtonProps) {
  return (
    <Button size="lg" variant="outline" onClick={onClick} className="cursor-pointer">
      <Plus /> Create new {subject}
    </Button>
  )
}