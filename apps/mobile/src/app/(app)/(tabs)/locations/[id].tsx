import { ScrollView } from "react-native";
import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { LocationDetailsCard } from "@/components/location/LocationDetailsCard";
import { LocationStoragesList } from "@/components/location/LocationStoragesList";

export default function ViewLocationScreen() {
  const commonStyles = useCommonStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const locationQuery = useApiQuery({
    queryKey: ["locations", Number(id)],
    queryFn: () => api.locations.getById(Number(id)),
  });

  const result = queryGate([locationQuery]);
  if (!result.ready) return result.gate;

  const [location] = result.data;

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader
        title={location.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/locations/${id}/edit`),
          },
        ]}
      />
      <ScrollView contentContainerStyle={commonStyles.detailScrollContent}>
        <LocationDetailsCard location={location} />
        <LocationStoragesList locationId={location.id} />
      </ScrollView>
    </SafeAreaView>
  );
}
