import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { wineFields, type WineFormData } from "@/lib/fields/wines";

export default function ViewWineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const wineQuery = useApiQuery({
    queryKey: ["wines", Number(id)],
    queryFn: () => api.wines.getById(Number(id)),
  });
  const grapeQuery = useApiQuery({
    queryKey: ["winegrapes", "wine", Number(id)],
    queryFn: () => api.winegrapes.getByWineId(Number(id)),
  });

  const result = queryGate([wineQuery, grapeQuery]);
  if (!result.ready) return result.gate;

  const [wine, wineGrapes] = result.data;
  const viewData: WineFormData = {
    ...wine,
    grapeIds: wineGrapes.map((wg) => wg.grapeId),
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title="Wine Details"
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/wines/${id}/edit`),
          },
        ]}
      />
      <FormCard mode="view" data={viewData} fields={wineFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
