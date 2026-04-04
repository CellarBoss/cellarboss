import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type RelatedResourceSectionProps = {
  heading: string;
  count?: number;
  addHref?: string;
  addLabel?: string;
  emptyMessage?: string;
  className?: string;
  children?: React.ReactNode;
};

export function RelatedResourceSection({
  heading,
  count,
  addHref,
  addLabel = "Add",
  emptyMessage = "None yet",
  className = "mt-6",
  children,
}: RelatedResourceSectionProps) {
  const isEmpty =
    !children || (Array.isArray(children) && children.length === 0);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {heading}
          {count !== undefined && <span className="ml-1">({count})</span>}
        </h2>
        {addHref && (
          <Link
            href={addHref}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Link>
        )}
      </div>
      <Card>
        <CardContent className="p-0">
          {isEmpty ? (
            <p className="text-sm text-muted-foreground px-4 py-3">
              {emptyMessage}
            </p>
          ) : (
            <div className="divide-y">{children}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
