import { View, StyleSheet } from "react-native";
import type { Bottle, Vintage, Wine } from "@cellarboss/types";
import { StatCard } from "./StatCard";
import { formatPrice, formatDrinkingStatus } from "@/lib/functions/format";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/use-app-theme";

type CellarOverviewStatsProps = {
  bottles: Bottle[];
  vintages: Vintage[];
  wines: Wine[];
  currency: string;
};

export function CellarOverviewStats({
  bottles,
  vintages,
  wines,
  currency,
}: CellarOverviewStatsProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));

  const storedBottles = bottles.filter((b) => b.status === "stored");

  const totalBottles = storedBottles.length;

  const uniqueWineIds = new Set(
    storedBottles
      .map((b) => {
        const vintage = vintageMap.get(b.vintageId);
        return vintage?.wineId;
      })
      .filter((id): id is number => id !== undefined),
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

  return (
    <View style={styles.grid}>
      <StatCard
        title="Bottles Stored"
        value={totalBottles}
        subtitle="in cellar"
        color={theme.colors.primary}
        onPress={() => router.push("/bottles")}
      />
      <StatCard
        title="Unique Wines"
        value={uniqueWines}
        subtitle="different wines"
        color="#a855f7"
      />
      <StatCard
        title="Cellar Value"
        value={formatPrice(cellarValue, currency)}
        subtitle="purchase price"
        color="#2E8B57"
      />
      <StatCard
        title="Ready to Drink"
        value={readyToDrink}
        subtitle="in drinking window"
        color="#DAA520"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
