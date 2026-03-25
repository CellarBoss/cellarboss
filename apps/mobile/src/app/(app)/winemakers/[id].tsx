import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { winemakerFields } from "@/lib/fields/winemakers";

export default function ViewWinemakerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers", Number(id)],
    queryFn: () => api.winemakers.getById(Number(id)),
  });

  const result = queryGate([winemakerQuery]);
  if (!result.ready) return result.gate;

  const [winemaker] = result.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={winemaker.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/winemakers/${id}/edit`),
          },
        ]}
      />
      <FormCard mode="view" data={winemaker} fields={winemakerFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
