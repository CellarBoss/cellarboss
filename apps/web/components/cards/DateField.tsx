"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DateFieldProps = {
  field: any;
  editable: boolean;
};

export function DateField({ field, editable }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const value: string = field.state.value ?? "";

  // Parse "YYYY-MM-DD" string to Date for the calendar (avoid timezone shift)
  const dateValue = value ? new Date(value + "T00:00:00Z") : undefined;

  const displayText = dateValue
    ? dateValue.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  if (!editable) {
    return (
      <div className="flex min-h-9 items-center px-3 py-2 border rounded-md bg-muted text-sm">
        {displayText ?? <span className="text-muted-foreground">No date</span>}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {displayText ?? "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(date) => {
            if (date) {
              const iso = date.toISOString().split("T")[0];
              field.handleChange(iso);
            }
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
