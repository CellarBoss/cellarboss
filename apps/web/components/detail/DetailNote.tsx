import { StickyNote } from "lucide-react";

type DetailNoteProps = {
  label: string;
  children?: string | null;
};

export function DetailNote({ label, children }: DetailNoteProps) {
  const notes = children?.trim();

  if (!notes) return null;

  return (
    <div className="mt-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <p className="mt-1 whitespace-pre-wrap break-words leading-relaxed text-foreground">
        {notes}
      </p>
    </div>
  );
}
