import { View, ScrollView, StyleSheet } from "react-native";
import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { VintageDetailsCard } from "@/components/vintage/VintageDetailsCard";
import { BottleDetailsCard } from "@/components/bottle/BottleDetailsCard";
import { StorageDetailsCard } from "@/components/storage/StorageDetailsCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewBottleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const bottleQuery = useApiQuery({
    queryKey: ["bottles", Number(id)],
    queryFn: () => api.bottles.getById(Number(id)),
  });

  const result = queryGate([bottleQuery]);
  if (!result.ready) return result.gate;

  const [bottle] = result.data;

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader
        title="Bottle Details"
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/bottles/${id}/edit`),
          },
        ]}
      />
      <ScrollView contentContainerStyle={commonStyles.detailScrollContent}>
        <VintageDetailsCard vintageId={bottle.vintageId} />
        <View style={styles.section}>
          <BottleDetailsCard bottle={bottle} />
        </View>
        {bottle.storageId != null && (
          <View style={styles.section}>
            <StorageDetailsCard storageId={bottle.storageId} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
});
