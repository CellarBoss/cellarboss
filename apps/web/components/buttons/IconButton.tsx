import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";

type IconButtonProps = {
  icon: LucideIcon;
  tooltip: string;
  onClick?: (() => void) | (() => Promise<void>);
  children?: React.ReactNode;
  trigger?: React.ComponentType<{
    asChild?: boolean;
    children: React.ReactNode;
  }>;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon: Icon, tooltip, onClick, children, trigger: Trigger },
    ref,
  ) {
    const button = (
      <Button
        ref={ref}
        size="sm"
        variant="outline"
        onClick={onClick}
        className="cursor-pointer"
      >
        <Icon />
        {children}
      </Button>
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {Trigger ? <Trigger asChild>{button}</Trigger> : button}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  },
);
