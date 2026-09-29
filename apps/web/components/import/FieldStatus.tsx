import type { ImportResolution } from "@cellarboss/types";
import {
  CircleAlert,
  CircleCheck,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fieldStatus,
  grapesResetTarget,
  pendingName,
  pendingValue,
  resetTarget,
} from "@/lib/functions/import";

type StatusKind = "matched" | "new" | "check" | "changed";

const statusIcons: Record<StatusKind, { Icon: LucideIcon; className: string }> =
  {
    matched: {
      Icon: CircleCheck,
      className: "text-green-600 dark:text-green-500",
    },
    new: { Icon: CircleCheck, className: "text-blue-600 dark:text-blue-400" },
    check: {
      Icon: CircleAlert,
      className: "text-amber-500 dark:text-amber-400",
    },
    changed: { Icon: RotateCcw, className: "text-muted-foreground" },
  };

function StatusText({
  kind,
  children,
}: {
  kind: StatusKind;
  children: React.ReactNode;
}) {
  const { Icon, className } = statusIcons[kind];
  return (
    <p
      className="-mt-1 mb-2 flex items-start gap-1.5 text-xs text-muted-foreground"
      data-testid="import-field-status"
      data-status={kind}
    >
      <Icon className={`size-4 shrink-0 ${className}`} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

function LinkButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="link"
      className="h-auto p-0 text-xs"
      onClick={onClick}
    >
      {children}
    </Button>
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
    <LinkButton onClick={onClick}>
      Create &ldquo;{name}&rdquo; instead
    </LinkButton>
  );
}

function ResetTo({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <LinkButton onClick={onClick}>Reset to &ldquo;{name}&rdquo;</LinkButton>
  );
}

/**
 * How a selector's current value relates to what the page said, with a way
 * back to the import's value once the user has changed it.
 */
export function FieldStatusLine({
  resolution,
  value,
  onChange,
}: {
  resolution: ImportResolution | undefined;
  value: string;
  onChange: (value: string) => void;
}) {
  const status = fieldStatus(resolution, value);
  const reset = resetTarget(resolution, value);
  const resetLink = reset && (
    <ResetTo name={reset.name} onClick={() => onChange(reset.value)} />
  );
  if (!status) {
    return resetLink ? (
      <StatusText kind="changed">
        Changed from what the page said. {resetLink}
      </StatusText>
    ) : null;
  }
  switch (status.kind) {
    case "matched":
      return (
        <StatusText kind="matched">
          Matched: will use the one you already have
        </StatusText>
      );
    case "new":
      return (
        <StatusText kind="new">
          New: will be created when you save.{resetLink && " "}
          {resetLink}
        </StatusText>
      );
    case "suggested":
      return (
        <StatusText kind="check">
          Check: close match for &ldquo;{status.proposedName}&rdquo;, will use
          the one you already have.{" "}
          <CreateInstead
            name={status.proposedName}
            onClick={() => onChange(pendingValue(status.proposedName))}
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
  const reset = grapesResetTarget(resolutions, values);

  return (
    <>
      {suggestions.map((s) => (
        <StatusText key={s.id} kind="check">
          Check: close match for &ldquo;{s.proposedName}&rdquo;, will use the
          one you already have.{" "}
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
        <StatusText kind="new">
          New: {created.join(", ")} will be created when you save
        </StatusText>
      )}
      {reset && (
        <StatusText kind="changed">
          Changed from what the page said.{" "}
          <LinkButton onClick={() => onChange(reset.values)}>
            Reset to {reset.names.join(", ")}
          </LinkButton>
        </StatusText>
      )}
    </>
  );
}

export function LowConfidenceHint() {
  return (
    <StatusText kind="check">
      Check: the page didn&rsquo;t say this clearly
    </StatusText>
  );
}
