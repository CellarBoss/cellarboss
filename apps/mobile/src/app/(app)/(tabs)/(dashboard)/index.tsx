import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { useSetting } from "@/hooks/use-settings";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { CellarOverviewStats } from "@/components/dashboard/CellarOverviewStats";
import { WineTypeBreakdown } from "@/components/dashboard/WineTypeBreakdown";
import { DrinkingWindowTimeline } from "@/components/dashboard/DrinkingWindowTimeline";
import { CellarValueOverTime } from "@/components/dashboard/CellarValueOverTime";
import { TopRatedWines } from "@/components/dashboard/TopRatedWines";
import { DrinkingSuggestions } from "@/components/dashboard/DrinkingSuggestions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function DashboardScreen() {
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 16, paddingBottom: 32 },
  });
  const bottleQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: () => api.bottles.getAll(),
  });
  const vintageQuery = useApiQuery({
    queryKey: ["vintages"],
    queryFn: () => api.vintages.getAll(),
  });
  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });
  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });
  const regionQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: () => api.regions.getAll(),
  });
  const countryQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: () => api.countries.getAll(),
  });
  const tastingNoteQuery = useApiQuery({
    queryKey: ["tastingNotes"],
    queryFn: () => api.tastingNotes.getAll(),
  });
  const currencySetting = useSetting("currency");
  const currency = (currencySetting.data as string) || "USD";

  const result = queryGate([
    bottleQuery,
    vintageQuery,
    wineQuery,
    winemakerQuery,
    regionQuery,
    countryQuery,
    tastingNoteQuery,
  ]);

  if (!result.ready) return result.gate;

  const [
    bottles,
    vintages,
    wines,
    winemakers,
    _regions,
    _countries,
    tastingNotes,
  ] = result.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <CellarOverviewStats
          bottles={bottles}
          vintages={vintages}
          wines={wines}
          currency={currency}
        />
        <WineTypeBreakdown
          bottles={bottles}
          vintages={vintages}
          wines={wines}
        />
        <DrinkingWindowTimeline bottles={bottles} vintages={vintages} />
        <CellarValueOverTime bottles={bottles} currency={currency} />
        <TopRatedWines
          tastingNotes={tastingNotes}
          vintages={vintages}
          wines={wines}
          winemakers={winemakers}
        />
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
      </ScrollView>
    </SafeAreaView>
  );
}
