"use client";

import { useState } from "react";
import { Wine } from "lucide-react";
import { cn } from "@/lib/utils";

type WineGlassRatingProps = {
  field: any;
  editable: boolean;
};

function GlassIcon({
  fillState,
  className,
}: {
  fillState: 0 | 1 | 2;
  className?: string;
}) {
  return (
    <div className={cn("relative inline-flex size-7", className)}>
      {/* Empty background */}
      <Wine className="size-7 text-muted-foreground/30" />
      {/* Filled overlay, clipped by width */}
      {fillState > 0 && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: fillState === 1 ? "50%" : "100%" }}
        >
          <Wine className="size-7 text-amber-500" />
        </div>
      )}
    </div>
  );
}

function getGlassFill(
  glassIndex: number,
  value: number,
): 0 | 1 | 2 {
  const full = (glassIndex + 1) * 2;
  const half = glassIndex * 2 + 1;
  if (value >= full) return 2;
  if (value >= half) return 1;
  return 0;
}

export function WineGlassRating({ field, editable }: WineGlassRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const currentValue = Number(field.state.value) || 0;
  const displayValue = hoverValue ?? currentValue;

  const handleClick = (value: number) => {
    const newValue = currentValue === value ? 0 : value;
    field.handleChange(String(newValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newValue = currentValue;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        newValue = Math.min(10, currentValue + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        newValue = Math.max(0, currentValue - 1);
        break;
      case "Home":
        newValue = 0;
        break;
      case "End":
        newValue = 10;
        break;
      default:
        return;
    }
    e.preventDefault();
    field.handleChange(String(newValue));
  };

  if (!editable) {
    return (
      <div className="flex min-h-9 items-center gap-1 px-3 py-2 border rounded-md bg-muted">
        {Array.from({ length: 5 }, (_, i) => (
          <GlassIcon key={i} fillState={getGlassFill(i, currentValue)} />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentValue}/10
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-9 items-center gap-1 px-3 py-2 border rounded-md"
      role="slider"
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={currentValue}
      aria-label="Wine rating"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const leftValue = i * 2 + 1;
        const rightValue = i * 2 + 2;

        return (
          <div key={i} className="relative inline-flex size-7 cursor-pointer">
            <GlassIcon
              fillState={getGlassFill(i, displayValue)}
              className={
                hoverValue !== null && hoverValue !== currentValue
                  ? "[&>div:last-child]:text-amber-300"
                  : undefined
              }
            />
            {/* Left half click zone */}
            <button
              type="button"
              className="absolute inset-y-0 left-0 w-1/2"
              aria-label={`Rate ${leftValue} out of 10`}
              onMouseEnter={() => setHoverValue(leftValue)}
              onClick={() => handleClick(leftValue)}
              tabIndex={-1}
            />
            {/* Right half click zone */}
            <button
              type="button"
              className="absolute inset-y-0 right-0 w-1/2"
              aria-label={`Rate ${rightValue} out of 10`}
              onMouseEnter={() => setHoverValue(rightValue)}
              onClick={() => handleClick(rightValue)}
              tabIndex={-1}
            />
          </div>
        );
      })}
      <span className="ml-2 text-sm text-muted-foreground">
        {currentValue}/10
      </span>
    </div>
  );
}
