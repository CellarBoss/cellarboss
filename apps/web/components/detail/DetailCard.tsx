import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type DetailCardProps = {
  heading?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
};

export function DetailCard({ heading, icon: Icon, children }: DetailCardProps) {
  return (
    <div>
      {heading && (
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">
          {heading}
        </h2>
      )}
      <Card>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-1">{children}</div>
            {Icon && <Icon className="h-10 w-10 text-primary shrink-0 mt-1" />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
