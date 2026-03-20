import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { bottleFields } from "@/lib/fields/bottles";
import { theme } from "@/lib/theme";

export default function ViewBottleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const bottleQuery = useApiQuery({
    queryKey: ["bottles", Number(id)],
    queryFn: () => api.bottles.getById(Number(id)),
  });

  const result = queryGate([bottleQuery]);
  if (!result.ready) return result.gate;

  const [bottle] = result.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title="Bottle Details"
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/bottles/${id}/edit`),
          },
        ]}
      />
      <FormCard mode="view" data={bottle} fields={bottleFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
