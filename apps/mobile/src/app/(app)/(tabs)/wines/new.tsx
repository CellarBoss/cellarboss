import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { api } from "@/lib/api/client";
import { wineFields, type WineFormData } from "@/lib/fields/wines";
import type { Wine } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

const defaultData: WineFormData = {
  id: 0,
  name: "",
  wineMakerId: 0,
  regionId: null,
  type: "red",
  grapeIds: [],
};

export default function NewWineScreen() {
  const { wineMakerId, regionId } = useLocalSearchParams<{
    wineMakerId?: string;
    regionId?: string;
  }>();
  const queryClient = useQueryClient();

  const initialData: WineFormData = {
    ...defaultData,
    ...(wineMakerId ? { wineMakerId: Number(wineMakerId) } : {}),
    ...(regionId ? { regionId: Number(regionId) } : {}),
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<WineFormData>> => {
    const grapeIds = data.grapeIds
      ? data.grapeIds.split(",").filter(Boolean).map(Number)
      : [];

    const result = await api.wines.create({
      id: 0,
      name: data.name,
      wineMakerId: Number(data.wineMakerId),
      regionId: data.regionId ? Number(data.regionId) : null,
      type: data.type as Wine["type"],
    });

    if (!result.ok) return result as ApiResult<WineFormData>;

    if (grapeIds.length > 0) {
      for (const grapeId of grapeIds) {
        await api.winegrapes.create({ wineId: result.data.id, grapeId });
      }
    }

    queryClient.invalidateQueries({ queryKey: ["wines"] });

    return {
      ok: true,
      data: { ...result.data, grapeIds },
    };
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="New Wine" showBack />
      <FormCard
        mode="create"
        data={initialData}
        fields={wineFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
