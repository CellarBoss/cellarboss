"use client";

import type { Wine, WineGrape } from "@cellarboss/types";
import { getCountries } from "@/lib/api/countries";
import { getWinemakerById } from "@/lib/api/winemakers";
import { getGrapes } from "@/lib/api/grapes";
import { getWineGrapes } from "@/lib/api/winegrapes";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";

export default function WineDetailRow({ wine }: { wine: Wine }) {
  const winemakerQuery = useApiQuery({
    queryKey: ["winemaker-" + wine.wineMakerId],
    queryFn: () => getWinemakerById(wine.wineMakerId),
  });

  const grapeQuery = useApiQuery({ queryKey: ["grapes"], queryFn: getGrapes });
  const wineGrapeQuery = useApiQuery({ queryKey: ["winegrapes"], queryFn: getWineGrapes });
  const countryQuery = useApiQuery({ queryKey: ["countries"], queryFn: getCountries });

  const result = queryGate(winemakerQuery, grapeQuery, wineGrapeQuery, countryQuery);
  if (!result.ready) return result.gate;

  const [winemaker, grapes, wineGrapes, countries] = result.data;

  return (
    <>
      This is a detail row for Wine. Winemaker: {winemaker.name}.
    </>
  );
}