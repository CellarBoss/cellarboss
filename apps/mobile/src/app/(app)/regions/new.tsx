import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { api } from "@/lib/api/client";
import { theme } from "@/lib/theme";
import { regionFields } from "@/lib/fields/regions";
import type { Region } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";

export default function NewRegionScreen() {
  const queryClient = useQueryClient();

  const defaultData: Region = {
    id: 0,
    name: "",
    countryId: 0,
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
    <SafeAreaView style={styles.container} edges={["top"]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
