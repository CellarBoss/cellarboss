import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { wineFields, type WineFormData } from "@/lib/fields/wines";
import type { Wine } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function EditWineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const wineQuery = useApiQuery({
    queryKey: ["wines", Number(id)],
    queryFn: () => api.wines.getById(Number(id)),
  });
  const grapeQuery = useApiQuery({
    queryKey: ["winegrapes", "wine", Number(id)],
    queryFn: () => api.winegrapes.getByWineId(Number(id)),
  });

  const result = queryGate([wineQuery, grapeQuery]);
  if (!result.ready) return result.gate;

  const [wine, existingGrapes] = result.data;
  const editData: WineFormData = {
    ...wine,
    grapeIds: existingGrapes.map((wg) => wg.grapeId),
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<WineFormData>> => {
    const wineResult = await api.wines.update({
      id: Number(id),
      name: data.name,
      wineMakerId: Number(data.wineMakerId),
      regionId: data.regionId ? Number(data.regionId) : null,
      type: data.type as Wine["type"],
    });

    if (!wineResult.ok) return wineResult as ApiResult<WineFormData>;

    // Sync grape associations
    const newGrapeIds = data.grapeIds
      ? data.grapeIds.split(",").filter(Boolean).map(Number)
      : [];
    const oldGrapeIds = existingGrapes.map((wg) => wg.grapeId);

    const toAdd = newGrapeIds.filter((gid) => !oldGrapeIds.includes(gid));
    const toRemove = existingGrapes.filter(
      (wg) => !newGrapeIds.includes(wg.grapeId),
    );

    for (const grapeId of toAdd) {
      await api.winegrapes.create({ wineId: Number(id), grapeId });
    }
    for (const wg of toRemove) {
      await api.winegrapes.delete(wg.id);
    }

    queryClient.invalidateQueries({ queryKey: ["wines"] });
    queryClient.invalidateQueries({ queryKey: ["winegrapes"] });

    return {
      ok: true,
      data: { ...wineResult.data, grapeIds: newGrapeIds },
    };
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="Edit Wine" showBack />
      <FormCard
        mode="edit"
        data={editData}
        fields={wineFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
