import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { regionFields } from "@/lib/fields/regions";
import type { Region } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

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
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
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
