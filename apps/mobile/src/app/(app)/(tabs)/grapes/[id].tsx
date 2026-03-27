import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { GrapeDetailsCard } from "@/components/grape/GrapeDetailsCard";
import { GrapeWinesList } from "@/components/grape/GrapeWinesList";

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
      <ScrollView contentContainerStyle={styles.scroll}>
        <GrapeDetailsCard grape={grape} />
        <GrapeWinesList grapeId={grape.id} />
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
