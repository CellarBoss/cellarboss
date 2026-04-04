import type { LucideIcon } from "lucide-react";

type DetailRowProps = {
  icon: LucideIcon;
  children: React.ReactNode;
};

export function DetailRow({ icon: Icon, children }: DetailRowProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
