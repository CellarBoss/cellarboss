"use client";

import type { Wine } from "@cellarboss/types";
import { getWinemakerById } from "@/lib/api/winemakers";
import { getGrapes } from "@/lib/api/grapes";
import { getWineGrapesByWineId } from "@/lib/api/winegrapes";
import { getRegionById } from "@/lib/api/regions";
import { getCountryById } from "@/lib/api/countries";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";
import { getVintagesByWineId } from "@/lib/api/vintages";
import { Badge } from "@/components/ui/badge";
import { Earth, User, Grape, Wine as WineIcon, Plus } from "lucide-react";
import Link from "next/link";

export default function WineDetailRow({ wine }: { wine: Wine }) {
  const winemakerQuery = useApiQuery({
    queryKey: ["winemaker", wine.wineMakerId],
    queryFn: () => getWinemakerById(wine.wineMakerId),
  });

  const grapeQuery = useApiQuery({ queryKey: ["grapes"], queryFn: getGrapes });
  const wineGrapeQuery = useApiQuery({
    queryKey: ["winegrapes", wine.id],
    queryFn: () => getWineGrapesByWineId(wine.id),
  });

  const regionQuery = useApiQuery({
    queryKey: ["region", wine.regionId],
    queryFn: () => getRegionById(wine.regionId!),
    enabled: wine.regionId !== null,
  });

  const countryQuery = useApiQuery({
    queryKey: ["country", regionQuery.data?.countryId],
    queryFn: () => getCountryById(regionQuery.data!.countryId),
    enabled: regionQuery.isSuccess,
  });

  const vintageQuery = useApiQuery({
    queryKey: ["vintages", wine.id],
    queryFn: () => getVintagesByWineId(wine.id),
  });

  const result = queryGate(winemakerQuery, grapeQuery, wineGrapeQuery);
  if (!result.ready) return result.gate;

  const [winemaker, grapes, wineGrapes] = result.data;

  const region = regionQuery.data;
  const country = countryQuery.data;

  const grapeEntries = wineGrapes
    .map((wg) => {
      const grape = grapes.find((g) => g.id === wg.grapeId);
      return grape ? { id: grape.id, name: grape.name } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <div className="grid grid-cols-[auto_1fr_1fr] gap-6">
      <div className="flex items-center justify-center w-24 h-32 rounded-lg bg-muted">
        <WineIcon className="w-10 h-10 text-muted-foreground" />
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <Link href={`/wines/${wine.id}`} className="inline-flex items-center gap-1.5 font-bold text-xl hover:underline">
          {wine.name}
        </Link>
        <span className="inline-flex items-center gap-1.5">
          <User className="h-3.5 w-5 shrink-0" />
          <Link href={`/winemakers/${winemaker.id}`} className="hover:underline">
            {winemaker.name}
          </Link>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Earth className="h-3.5 w-5 shrink-0" />
          {region ? (
            <Link href={`/regions/${region.id}`} className="hover:underline">
              {region.name}, {country?.name ?? "..."}
            </Link>
          ) : "\u2014"}
        </span>
        {grapeEntries.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Grape className="h-3.5 w-5 shrink-0" />
            {grapeEntries.map((grape) => (
              <Link key={grape.id} href={`/grapes/${grape.id}`}>
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  {grape.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm">
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground">Vintages</span>
          <Link href={`/vintages/new?wineId=${wine.id}`}>
            <Plus className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </Link>
        </span>

        {vintageQuery.isLoading ? (
          <p className="mt-1 text-muted-foreground italic">Loading...</p>
        ) : vintageQuery.data && vintageQuery.data.length > 0 ? (
          <ul className="mt-1 space-y-1">
            {vintageQuery.data.map((v) => (
              <li key={v.id} className="flex items-center gap-2">
                <Link href={`/vintages/${v.id}`} className="hover:underline">
                  {v.year ?? "NV"}
                </Link>
                {(v.drinkFrom || v.drinkUntil) && (
                  <span className="text-muted-foreground text-xs">
                    ({v.drinkFrom ?? "?"} - {v.drinkUntil ?? "?"})
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-muted-foreground italic">No vintages</p>
        )}
      </div>
    </div>
  );
}
