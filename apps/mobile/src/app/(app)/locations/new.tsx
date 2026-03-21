import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { api } from "@/lib/api/client";
import { theme } from "@/lib/theme";
import { locationFields } from "@/lib/fields/locations";
import type { Location } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function NewLocationScreen() {
  const queryClient = useQueryClient();

  const defaultData: Location = {
    id: 0,
    name: "",
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Location>> => {
    const result = await api.locations.create({
      id: 0,
      name: data.name,
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="New Location" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={locationFields}
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
