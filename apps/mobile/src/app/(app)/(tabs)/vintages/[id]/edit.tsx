import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { vintageFields } from "@/lib/fields/vintages";
import type { Vintage } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function EditVintageScreen() {
  const commonStyles = useCommonStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const vintageQuery = useApiQuery({
    queryKey: ["vintages", Number(id)],
    queryFn: () => api.vintages.getById(Number(id)),
  });

  const result = queryGate([vintageQuery]);
  if (!result.ready) return result.gate;

  const [vintage] = result.data;

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Vintage>> => {
    const updateResult = await api.vintages.update({
      id: Number(id),
      year: data.year ? Number(data.year) : null,
      wineId: Number(data.wineId),
      drinkFrom: data.drinkFrom ? Number(data.drinkFrom) : null,
      drinkUntil: data.drinkUntil ? Number(data.drinkUntil) : null,
    });

    if (updateResult.ok) {
      queryClient.invalidateQueries({ queryKey: ["vintages"] });
    }

    return updateResult;
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="Edit Vintage" showBack />
      <FormCard
        mode="edit"
        data={vintage}
        fields={vintageFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
