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
import { regionFields } from "@/lib/fields/regions";
import type { Region } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";

export default function EditRegionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const regionQuery = useApiQuery({
    queryKey: ["regions", Number(id)],
    queryFn: () => api.regions.getById(Number(id)),
  });

  const result = queryGate([regionQuery]);
  if (!result.ready) return result.gate;

  const [region] = result.data;

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Region>> => {
    const updateResult = await api.regions.update({
      id: Number(id),
      name: data.name,
      countryId: Number(data.countryId),
    });

    if (updateResult.ok) {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    }

    return updateResult;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Edit Region" showBack />
      <FormCard
        mode="edit"
        data={region}
        fields={regionFields}
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
