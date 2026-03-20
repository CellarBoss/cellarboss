import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { vintageFields } from "@/lib/fields/vintages";

export default function ViewVintageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const vintageQuery = useApiQuery({
    queryKey: ["vintages", Number(id)],
    queryFn: () => api.vintages.getById(Number(id)),
  });

  const result = queryGate([vintageQuery]);
  if (!result.ready) return result.gate;

  const [vintage] = result.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={`Vintage - ${vintage.year ?? "NV"}`}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/vintages/${id}/edit`),
          },
        ]}
      />
      <FormCard mode="view" data={vintage} fields={vintageFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
