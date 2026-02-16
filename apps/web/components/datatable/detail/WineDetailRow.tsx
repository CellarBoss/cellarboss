"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Wine, WineGrape } from "@cellarboss/types";
import { getCountries } from "@/lib/api/countries";
import { getWinemakerById } from "@/lib/api/winemakers";
import { getRegionById } from "@/lib/api/regions";
import { getGrapes } from "@/lib/api/grapes";
import { getWineGrapes } from "@/lib/api/winegrapes";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function WineDetailRow({ wine }: { wine: Wine }) {
  const winemakerQuery = useQuery({
    queryKey: ["winemaker-" + wine.wineMakerId],
    queryFn: getWinemakerById.bind(null, wine.wineMakerId),
  });

  /*
  const regionQuery = useQuery({
    queryKey: ["regions"],
    queryFn: getRegionById.bind(null, wine.regionId),
  });
*/

  const grapeQuery = useQuery({
    queryKey: ["grapes"],
    queryFn: getGrapes,
  });

  const wineGrapeQuery = useQuery({
    queryKey: ["winegrapes"],
    queryFn: getWineGrapes,
  });

  const countryQuery = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  })

  if (winemakerQuery.isLoading || grapeQuery.isLoading || wineGrapeQuery.isLoading || countryQuery.isLoading) {
    return <LoadingCard />;
  }

    if (!winemakerQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + winemakerQuery.data?.error.message} />;
    //if (!regionQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + regionQuery.data?.error.message} />;
    if (!grapeQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + grapeQuery.data?.error.message} />;
    if (!wineGrapeQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + wineGrapeQuery.data?.error.message} />;
    if (!countryQuery.data?.ok) return <ErrorCard message={`Error receiving data: ` + countryQuery.data?.error.message} />;

  return (
    <>
      This is a detail row for Wine. Winemaker: {winemakerQuery.data?.data.name}. 
    </>
  );
}