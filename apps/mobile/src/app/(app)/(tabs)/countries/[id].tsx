import { ScrollView } from "react-native";
import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { CountryDetailsCard } from "@/components/country/CountryDetailsCard";
import { CountryRegionsList } from "@/components/country/CountryRegionsList";

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
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
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
      <ScrollView contentContainerStyle={commonStyles.detailScrollContent}>
        <CountryDetailsCard country={country} />
        <CountryRegionsList countryId={country.id} />
      </ScrollView>
    </SafeAreaView>
  );
}
