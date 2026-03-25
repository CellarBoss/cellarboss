import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { WineDetailsCard } from "@/components/wine/WineDetailsCard";
import { WineVintagesList } from "@/components/wine/WineVintagesList";
import { WineTastingNotesList } from "@/components/tasting-notes/TastingNotesList";

export default function ViewWineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const wineQuery = useApiQuery({
    queryKey: ["wines", Number(id)],
    queryFn: () => api.wines.getById(Number(id)),
  });

  const result = queryGate([wineQuery]);
  if (!result.ready) return result.gate;

  const [wine] = result.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={wine.name || "Wine Details"}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/wines/${id}/edit`),
          },
        ]}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <WineDetailsCard wine={wine} />
        <WineVintagesList wineId={wine.id} />
        <WineTastingNotesList wine={wine} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: 16,
  },
});
