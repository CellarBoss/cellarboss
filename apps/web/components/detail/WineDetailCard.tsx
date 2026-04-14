import Link from "next/link";
import { Barrel, User, Earth, Clock } from "lucide-react";
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
    </DetailCard>
  );
}
