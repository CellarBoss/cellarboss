import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { api } from "@/lib/api/client";
import { theme } from "@/lib/theme";
import { winemakerFields } from "@/lib/fields/winemakers";
import type { WineMaker } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";

export default function NewWinemakerScreen() {
  const queryClient = useQueryClient();

  const defaultData: WineMaker = {
    id: 0,
    name: "",
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<WineMaker>> => {
    const result = await api.winemakers.create({
      id: 0,
      name: data.name,
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["winemakers"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="New Winemaker" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={winemakerFields}
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
