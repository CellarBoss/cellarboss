import { useMemo } from "react";
import { Wine, Grape, Banknote, Clock } from "lucide-react";
import type { Bottle, Vintage, Wine as WineType } from "@cellarboss/types";
import { StatCard } from "./StatCard";
import { formatPrice, formatDrinkingStatus } from "@/lib/functions/format";

interface CellarOverviewStatsProps {
  bottles: Bottle[];
  vintages: Vintage[];
  wines: WineType[];
  currency: string;
}

export function CellarOverviewStats({
  bottles,
  vintages,
  wines,
  currency,
}: CellarOverviewStatsProps) {
  const stats = useMemo(() => {
    const vintageMap = new Map(vintages.map((v) => [v.id, v]));
    const wineMap = new Map(wines.map((w) => [w.id, w]));
    const storedBottles = bottles.filter((b) => b.status === "stored");
    const currentYear = new Date().getFullYear();

    const totalBottles = storedBottles.length;

    const uniqueWineIds = new Set(
      storedBottles
        .map((b) => vintageMap.get(b.vintageId)?.wineId)
        .filter(Boolean),
    );
    const uniqueWines = uniqueWineIds.size;

    const cellarValue = storedBottles.reduce(
      (sum, b) => sum + (b.purchasePrice || 0),
      0,
    );

    const readyToDrink = storedBottles.filter((b) => {
      const vintage = vintageMap.get(b.vintageId);
      if (!vintage) return false;
      return (
        formatDrinkingStatus(
          vintage.drinkFrom,
          vintage.drinkUntil,
          currentYear,
        ) === "drinkable"
      );
    }).length;

    return { totalBottles, uniqueWines, cellarValue, readyToDrink };
  }, [bottles, vintages, wines]);

  return (
    <>
      <StatCard
        title="Total Bottles"
        value={stats.totalBottles}
        subtitle="Currently in cellar"
        icon={Wine}
        accentColor="var(--chart-1)"
      />
      <StatCard
        title="Unique Wines"
        value={stats.uniqueWines}
        subtitle="Different wines stored"
        icon={Grape}
        accentColor="var(--chart-2)"
      />
      <StatCard
        title="Cellar Value"
        value={formatPrice(stats.cellarValue, currency)}
        subtitle="Total purchase price"
        icon={Banknote}
        accentColor="var(--chart-3)"
      />
      <StatCard
        title="Ready to Drink"
        value={stats.readyToDrink}
        subtitle="In their drinking window"
        icon={Clock}
        accentColor="var(--chart-4)"
      />
    </>
  );
}
