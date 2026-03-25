import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { api } from "@/lib/api/client";
import { theme } from "@/lib/theme";
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
  const queryClient = useQueryClient();

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="New Wine" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={wineFields}
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
