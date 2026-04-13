import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { grapeFields } from "@/lib/fields/grapes";
import type { Grape } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function EditGrapeScreen() {
  const commonStyles = useCommonStyles();
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
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
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
