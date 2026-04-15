import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { api } from "@/lib/api/client";
import { regionFields } from "@/lib/fields/regions";
import type { Region } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function NewRegionScreen() {
  const commonStyles = useCommonStyles();
  const { countryId: countryIdParam } = useLocalSearchParams<{
    countryId?: string;
  }>();
  const queryClient = useQueryClient();

  const defaultData: Region = {
    id: 0,
    name: "",
    countryId: countryIdParam ? Number(countryIdParam) : 0,
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Region>> => {
    const result = await api.regions.create({
      id: 0,
      name: data.name,
      countryId: Number(data.countryId),
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="New Region" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={regionFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
