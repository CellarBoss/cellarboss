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
import { storageFields } from "@/lib/fields/storages";
import type { Storage } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";

export default function EditStorageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const storageQuery = useApiQuery({
    queryKey: ["storages", Number(id)],
    queryFn: () => api.storages.getById(Number(id)),
  });

  const result = queryGate([storageQuery]);
  if (!result.ready) return result.gate;

  const [storage] = result.data;

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Storage>> => {
    const updateResult = await api.storages.update({
      id: Number(id),
      name: data.name,
      locationId: data.locationId ? Number(data.locationId) : null,
      parent: data.parent ? Number(data.parent) : null,
    });

    if (updateResult.ok) {
      queryClient.invalidateQueries({ queryKey: ["storages"] });
    }

    return updateResult;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Edit Storage" showBack />
      <FormCard
        mode="edit"
        data={storage}
        fields={storageFields}
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
