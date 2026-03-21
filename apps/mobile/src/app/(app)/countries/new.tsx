import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { api } from "@/lib/api/client";
import { theme } from "@/lib/theme";
import { countryFields } from "@/lib/fields/countries";
import type { Country } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";

export default function NewCountryScreen() {
  const queryClient = useQueryClient();

  const defaultData: Country = {
    id: 0,
    name: "",
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Country>> => {
    const result = await api.countries.create({
      name: data.name,
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="New Country" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={countryFields}
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
