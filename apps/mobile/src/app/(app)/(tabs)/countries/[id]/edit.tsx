import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { countryFields } from "@/lib/fields/countries";
import type { Country } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function EditCountryScreen() {
  const commonStyles = useCommonStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const countryQuery = useApiQuery({
    queryKey: ["countries", Number(id)],
    queryFn: () => api.countries.getById(Number(id)),
  });

  const result = queryGate([countryQuery]);
  if (!result.ready) return result.gate;

  const [country] = result.data;

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Country>> => {
    const updateResult = await api.countries.update({
      id: Number(id),
      name: data.name,
    });

    if (updateResult.ok) {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    }

    return updateResult;
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="Edit Country" showBack />
      <FormCard
        mode="edit"
        data={country}
        fields={countryFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
