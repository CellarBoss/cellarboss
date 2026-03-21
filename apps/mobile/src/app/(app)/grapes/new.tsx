import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { api } from "@/lib/api/client";
import { theme } from "@/lib/theme";
import { grapeFields } from "@/lib/fields/grapes";
import type { Grape } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";

export default function NewGrapeScreen() {
  const queryClient = useQueryClient();

  const defaultData: Grape = {
    id: 0,
    name: "",
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Grape>> => {
    const result = await api.grapes.create({
      name: data.name,
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["grapes"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="New Grape" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={grapeFields}
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
