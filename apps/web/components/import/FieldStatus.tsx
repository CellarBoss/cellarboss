import type { ImportResolution } from "@cellarboss/types";
import { Button } from "@/components/ui/button";
import { fieldStatus, pendingName, pendingValue } from "@/lib/functions/import";

function StatusText({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="-mt-1 mb-2 text-xs text-muted-foreground"
      data-testid="import-field-status"
    >
      {children}
    </p>
  );
}

function CreateInstead({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="link"
      className="h-auto p-0 text-xs"
      onClick={onClick}
    >
      Create &ldquo;{name}&rdquo; instead
    </Button>
  );
}

/** How a selector's current value relates to what the page said. */
export function FieldStatusLine({
  resolution,
  value,
  onCreateInstead,
}: {
  resolution: ImportResolution | undefined;
  value: string;
  onCreateInstead: (value: string) => void;
}) {
  const status = fieldStatus(resolution, value);
  if (!status) return null;
  switch (status.kind) {
    case "matched":
      return <StatusText>Matched</StatusText>;
    case "new":
      return <StatusText>New: will be created</StatusText>;
    case "suggested":
      return (
        <StatusText>
          Close match for &ldquo;{status.proposedName}&rdquo;.{" "}
          <CreateInstead
            name={status.proposedName}
            onClick={() => onCreateInstead(pendingValue(status.proposedName))}
          />
        </StatusText>
      );
  }
}

/** Close matches and new grapes, one line each. */
export function GrapeStatusLines({
  resolutions,
  values,
  onChange,
}: {
  resolutions: ImportResolution[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const suggestions = resolutions.flatMap((r) =>
    r.status === "suggested" && values.includes(String(r.candidates[0].id))
      ? [{ id: String(r.candidates[0].id), proposedName: r.proposedName }]
      : [],
  );
  const created = values
    .map(pendingName)
    .filter((name): name is string => name !== null);

  return (
    <>
      {suggestions.map((s) => (
        <StatusText key={s.id}>
          Close match for &ldquo;{s.proposedName}&rdquo;.{" "}
          <CreateInstead
            name={s.proposedName}
            onClick={() =>
              onChange(
                values.map((v) =>
                  v === s.id ? pendingValue(s.proposedName) : v,
                ),
              )
            }
          />
        </StatusText>
      ))}
      {created.length > 0 && (
        <StatusText>New: {created.join(", ")} will be created</StatusText>
      )}
    </>
  );
}

export function LowConfidenceHint() {
  return (
    <StatusText>Check this: the page didn&rsquo;t say this clearly</StatusText>
  );
}
