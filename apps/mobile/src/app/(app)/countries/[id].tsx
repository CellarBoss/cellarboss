import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { countryFields } from "@/lib/fields/countries";

export default function ViewCountryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const countryQuery = useApiQuery({
    queryKey: ["countries", Number(id)],
    queryFn: () => api.countries.getById(Number(id)),
  });

  const result = queryGate([countryQuery]);
  if (!result.ready) return result.gate;

  const [country] = result.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={country.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/countries/${id}/edit`),
          },
        ]}
      />
      <FormCard mode="view" data={country} fields={countryFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
