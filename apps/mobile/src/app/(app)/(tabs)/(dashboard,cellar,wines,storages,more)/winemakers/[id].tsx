import { ScrollView } from "react-native";
import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { WinemakerDetailsCard } from "@/components/winemaker/WinemakerDetailsCard";
import { WinemakerWinesList } from "@/components/winemaker/WinemakerWinesList";

export default function ViewWinemakerScreen() {
  const commonStyles = useCommonStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers", Number(id)],
    queryFn: () => api.winemakers.getById(Number(id)),
  });

  const result = queryGate([winemakerQuery]);
  if (!result.ready) return result.gate;

  const [winemaker] = result.data;

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader
        title={winemaker.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/winemakers/${id}/edit`),
          },
        ]}
      />
      <ScrollView contentContainerStyle={commonStyles.detailScrollContent}>
        <WinemakerDetailsCard winemaker={winemaker} />
        <WinemakerWinesList winemakerId={winemaker.id} />
      </ScrollView>
    </SafeAreaView>
  );
}
