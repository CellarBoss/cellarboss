import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { grapeFields } from "@/lib/fields/grapes";

export default function ViewGrapeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const grapeQuery = useApiQuery({
    queryKey: ["grapes", Number(id)],
    queryFn: () => api.grapes.getById(Number(id)),
  });

  const result = queryGate([grapeQuery]);
  if (!result.ready) return result.gate;

  const [grape] = result.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={grape.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/grapes/${id}/edit`),
          },
        ]}
      />
      <FormCard mode="view" data={grape} fields={grapeFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
