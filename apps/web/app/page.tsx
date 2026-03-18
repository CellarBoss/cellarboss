"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { useSettingsContext } from "@/contexts/settings-context";
import { getBottles } from "@/lib/api/bottles";
import { getVintages } from "@/lib/api/vintages";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getCountries } from "@/lib/api/countries";
import { getAllTastingNotes } from "@/lib/api/tastingNotes";
import { queryGate } from "@/lib/functions/query-gate";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { CellarOverviewStats } from "@/components/dashboard/CellarOverviewStats";
import { WineTypeBreakdown } from "@/components/dashboard/WineTypeBreakdown";
import { DrinkingWindowTimeline } from "@/components/dashboard/DrinkingWindowTimeline";
import { CellarValueOverTime } from "@/components/dashboard/CellarValueOverTime";
import { CountryDistribution } from "@/components/dashboard/CountryDistribution";
import { TopRatedWines } from "@/components/dashboard/TopRatedWines";
import { DrinkingSuggestions } from "@/components/dashboard/DrinkingSuggestions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function Home() {
  const bottleQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: getBottles,
  });
  const vintageQuery = useApiQuery({
    queryKey: ["vintages"],
    queryFn: getVintages,
  });
  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: getWines,
  });
  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  });
  const regionQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });
  const countryQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
  const tastingNoteQuery = useApiQuery({
    queryKey: ["tastingNotes"],
    queryFn: getAllTastingNotes,
  });
  const settings = useSettingsContext();

  const result = queryGate(
    [
      bottleQuery,
      vintageQuery,
      wineQuery,
      winemakerQuery,
      regionQuery,
      countryQuery,
      tastingNoteQuery,
    ],
    { loadingComponent: <DashboardSkeleton /> },
  );

  if (!result.ready) return result.gate;

  const [
    bottles,
    vintages,
    wines,
    winemakers,
    regions,
    countries,
    tastingNotes,
  ] = result.data;

  const currency = (settings.get("currency") as string) || "USD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          CellarBoss Dashboard
        </h1>
        <p className="text-muted-foreground">Your cellar at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CellarOverviewStats
          bottles={bottles}
          vintages={vintages}
          wines={wines}
          currency={currency}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WineTypeBreakdown
          bottles={bottles}
          vintages={vintages}
          wines={wines}
        />
        <div className="lg:col-span-2">
          <DrinkingWindowTimeline bottles={bottles} vintages={vintages} />
        </div>
      </div>

      <CellarValueOverTime bottles={bottles} currency={currency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopRatedWines
          tastingNotes={tastingNotes}
          vintages={vintages}
          wines={wines}
          winemakers={winemakers}
        />
        <CountryDistribution
          bottles={bottles}
          vintages={vintages}
          wines={wines}
          regions={regions}
          countries={countries}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DrinkingSuggestions
          bottles={bottles}
          vintages={vintages}
          wines={wines}
          winemakers={winemakers}
        />
        <RecentActivity
          bottles={bottles}
          tastingNotes={tastingNotes}
          vintages={vintages}
          wines={wines}
          winemakers={winemakers}
        />
      </div>
    </div>
  );
}
