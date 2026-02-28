"use client";

import { useState } from "react";

type WineGlassRatingProps = {
  field: any;
  editable: boolean;
};

export function WineGlassRating({ field, editable }: WineGlassRatingProps) {
  const currentValue = Number(field.state.value) || 0;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const displayValue = editable && hoverIndex !== null ? hoverIndex + 1 : currentValue;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
      <div
        className="flex gap-0.5"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {Array.from({ length: 10 }, (_, i) => {
          const active = i < displayValue;
          return (
            <button
              key={i}
              type="button"
              disabled={!editable}
              onMouseEnter={() => editable && setHoverIndex(i)}
              onClick={() => {
                const newValue = i + 1 === currentValue ? 0 : i + 1;
                field.handleChange(String(newValue));
              }}
              className={`text-xl transition-all ${
                editable ? "cursor-pointer hover:scale-110" : "cursor-default"
              } ${active ? "opacity-100" : "opacity-25 grayscale"}`}
            >
              🍷
            </button>
          );
        })}
      </div>
      <span className="text-sm text-muted-foreground">{displayValue}/10</span>
    </div>
  );
}
