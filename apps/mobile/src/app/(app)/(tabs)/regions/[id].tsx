import { ScrollView } from "react-native";
import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { RegionDetailsCard } from "@/components/region/RegionDetailsCard";
import { RegionWinesList } from "@/components/region/RegionWinesList";

export default function ViewRegionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const regionQuery = useApiQuery({
    queryKey: ["regions", Number(id)],
    queryFn: () => api.regions.getById(Number(id)),
  });

  const result = queryGate([regionQuery]);
  if (!result.ready) return result.gate;

  const [region] = result.data;

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader
        title={region.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/regions/${id}/edit`),
          },
        ]}
      />
      <ScrollView contentContainerStyle={commonStyles.detailScrollContent}>
        <RegionDetailsCard region={region} />
        <RegionWinesList regionId={region.id} />
      </ScrollView>
    </SafeAreaView>
  );
}
