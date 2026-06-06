import Link from "next/link";
import { Barrel, User, Earth, Clock, StickyNote } from "lucide-react";
import type {
  Wine,
  Vintage,
  WineMaker,
  Region,
  Country,
} from "@cellarboss/types";
import { DetailCard } from "./DetailCard";
import { DetailRow } from "./DetailRow";
import { DrinkingWindowDisplay } from "@/components/vintage/DrinkingWindowDisplay";

type Props = {
  wine: Wine | undefined;
  vintage: Vintage | undefined;
  winemaker: WineMaker | undefined;
  region: Region | undefined;
  country: Country | undefined;
};

function hasNote(value: string | null | undefined): value is string {
  return value !== null && value !== undefined && value.trim() !== "";
}

export function WineDetailCard({
  wine,
  vintage,
  winemaker,
  region,
  country,
}: Props) {
  const yearDisplay =
    vintage === undefined
      ? null
      : vintage.year !== null
        ? String(vintage.year)
        : "NV";
  const notes = [
    { label: "Wine", value: wine?.notes },
    { label: "Vintage", value: vintage?.notes },
  ].filter((note): note is { label: string; value: string } =>
    hasNote(note.value),
  );

  return (
    <DetailCard heading="Wine" icon={Barrel}>
      <h3 className="text-lg font-semibold">
        {wine ? (
          <Link href={`/wines/${wine.id}`} className="hover:underline">
            {wine.name}
          </Link>
        ) : (
          "Unknown wine"
        )}
        {vintage && yearDisplay !== null && (
          <Link
            href={`/vintages/${vintage.id}`}
            className="text-muted-foreground ml-2 hover:underline"
          >
            {yearDisplay}
          </Link>
        )}
      </h3>
      {winemaker && (
        <DetailRow icon={User}>
          <Link
            href={`/winemakers/${winemaker.id}`}
            className="hover:underline text-primary"
          >
            {winemaker.name}
          </Link>
        </DetailRow>
      )}
      {(region || country) && (
        <DetailRow icon={Earth}>
          {[region?.name, country?.name].filter(Boolean).join(", ")}
        </DetailRow>
      )}
      {vintage && (
        <DetailRow icon={Clock}>
          <DrinkingWindowDisplay
            drinkFrom={vintage.drinkFrom}
            drinkUntil={vintage.drinkUntil}
          />
        </DetailRow>
      )}
      {notes.length > 0 && (
        <section className="mt-4 border-t border-border pt-3 text-sm">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <StickyNote className="h-3.5 w-3.5" />
            <span>Notes</span>
          </div>
          <div className="space-y-2 text-muted-foreground">
            {notes.map((note) => (
              <p key={note.label} className="leading-6">
                {notes.length > 1 && (
                  <span className="mr-1 font-medium text-foreground">
                    {note.label}:
                  </span>
                )}
                {note.value}
              </p>
            ))}
          </div>
        </section>
      )}
    </DetailCard>
  );
}
