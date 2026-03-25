import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { api } from "@/lib/api/client";
import { theme } from "@/lib/theme";
import { vintageFields } from "@/lib/fields/vintages";
import type { Vintage } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function NewVintageScreen() {
  const queryClient = useQueryClient();
  const { wineId } = useLocalSearchParams<{ wineId?: string }>();

  const defaultData: Vintage = {
    id: 0,
    year: null,
    wineId: wineId ? Number(wineId) : 0,
    drinkFrom: null,
    drinkUntil: null,
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Vintage>> => {
    const result = await api.vintages.create({
      year: data.year ? Number(data.year) : null,
      wineId: Number(data.wineId),
      drinkFrom: data.drinkFrom ? Number(data.drinkFrom) : null,
      drinkUntil: data.drinkUntil ? Number(data.drinkUntil) : null,
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["vintages"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="New Vintage" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={vintageFields}
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
