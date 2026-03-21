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
import { winemakerFields } from "@/lib/fields/winemakers";
import type { WineMaker } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function EditWinemakerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers", Number(id)],
    queryFn: () => api.winemakers.getById(Number(id)),
  });

  const result = queryGate([winemakerQuery]);
  if (!result.ready) return result.gate;

  const [winemaker] = result.data;

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<WineMaker>> => {
    const updateResult = await api.winemakers.update({
      id: Number(id),
      name: data.name,
    });

    if (updateResult.ok) {
      queryClient.invalidateQueries({ queryKey: ["winemakers"] });
    }

    return updateResult;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Edit Winemaker" showBack />
      <FormCard
        mode="edit"
        data={winemaker}
        fields={winemakerFields}
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
