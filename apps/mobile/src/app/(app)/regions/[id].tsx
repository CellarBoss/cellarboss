import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { regionFields } from "@/lib/fields/regions";

export default function ViewRegionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const regionQuery = useApiQuery({
    queryKey: ["regions", Number(id)],
    queryFn: () => api.regions.getById(Number(id)),
  });

  const result = queryGate([regionQuery]);
  if (!result.ready) return result.gate;

  const [region] = result.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={region.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/regions/${id}/edit`),
          },
        ]}
      />
      <FormCard mode="view" data={region} fields={regionFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
