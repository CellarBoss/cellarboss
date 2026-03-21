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
import { locationFields } from "@/lib/fields/locations";
import type { Location } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";

export default function EditLocationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const locationQuery = useApiQuery({
    queryKey: ["locations", Number(id)],
    queryFn: () => api.locations.getById(Number(id)),
  });

  const result = queryGate([locationQuery]);
  if (!result.ready) return result.gate;

  const [location] = result.data;

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Location>> => {
    const updateResult = await api.locations.update({
      id: Number(id),
      name: data.name,
    });

    if (updateResult.ok) {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    }

    return updateResult;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Edit Location" showBack />
      <FormCard
        mode="edit"
        data={location}
        fields={locationFields}
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
