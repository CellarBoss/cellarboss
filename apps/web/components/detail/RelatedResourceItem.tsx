import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

type RelatedResourceItemProps = {
  href: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  badge?: React.ReactNode;
};

export function RelatedResourceItem({
  href,
  icon: Icon,
  children,
  badge,
}: RelatedResourceItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
      <span className="flex-1 text-sm truncate">{children}</span>
      {badge && <span className="shrink-0">{badge}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
