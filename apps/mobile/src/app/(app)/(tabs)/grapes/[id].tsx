import { ScrollView } from "react-native";
import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { GrapeDetailsCard } from "@/components/grape/GrapeDetailsCard";
import { GrapeWinesList } from "@/components/grape/GrapeWinesList";

export default function ViewGrapeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const grapeQuery = useApiQuery({
    queryKey: ["grapes", Number(id)],
    queryFn: () => api.grapes.getById(Number(id)),
  });

  const result = queryGate([grapeQuery]);
  if (!result.ready) return result.gate;

  const [grape] = result.data;

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader
        title={grape.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/grapes/${id}/edit`),
          },
        ]}
      />
      <ScrollView contentContainerStyle={commonStyles.detailScrollContent}>
        <GrapeDetailsCard grape={grape} />
        <GrapeWinesList grapeId={grape.id} />
      </ScrollView>
    </SafeAreaView>
  );
}
