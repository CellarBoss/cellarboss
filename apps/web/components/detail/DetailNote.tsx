import { StickyNote } from "lucide-react";

type DetailNoteProps = {
  label: string;
  children?: string | null;
};

type DetailNotesProps = {
  heading: string;
  notes: Array<{
    label: string;
    value?: string | null;
  }>;
};

function hasNote(value: string | null | undefined) {
  return value !== null && value !== undefined && value.trim() !== "";
}

export function DetailNotes({ heading, notes }: DetailNotesProps) {
  const visibleNotes = notes.filter((note) => hasNote(note.value));

  if (visibleNotes.length === 0) return null;

  return (
    <section className="mt-4 border-t border-border pt-3 text-sm">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        <span>{heading}</span>
      </div>
      <div className="mt-2 space-y-3">
        {visibleNotes.map((note) => (
          <div key={note.label}>
            {visibleNotes.length > 1 && (
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                {note.label}
              </div>
            )}
            <p className="whitespace-pre-wrap break-words leading-relaxed text-foreground">
              {note.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DetailNote({ label, children }: DetailNoteProps) {
  return <DetailNotes heading={label} notes={[{ label, value: children }]} />;
}
