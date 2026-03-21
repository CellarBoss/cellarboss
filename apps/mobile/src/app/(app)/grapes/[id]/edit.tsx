import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { grapeFields } from "@/lib/fields/grapes";
import type { Grape } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";

export default function EditGrapeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const grapeQuery = useApiQuery({
    queryKey: ["grapes", Number(id)],
    queryFn: () => api.grapes.getById(Number(id)),
  });

  const result = queryGate([grapeQuery]);
  if (!result.ready) return result.gate;

  const [grape] = result.data;

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Grape>> => {
    const updateResult = await api.grapes.update({
      id: Number(id),
      name: data.name,
    });

    if (updateResult.ok) {
      queryClient.invalidateQueries({ queryKey: ["grapes"] });
    }

    return updateResult;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Edit Grape" showBack />
      <FormCard
        mode="edit"
        data={grape}
        fields={grapeFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
