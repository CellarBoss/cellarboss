import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import { storageFields } from "@/lib/fields/storages";

export default function ViewStorageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const storageQuery = useApiQuery({
    queryKey: ["storages", Number(id)],
    queryFn: () => api.storages.getById(Number(id)),
  });

  const result = queryGate([storageQuery]);
  if (!result.ready) return result.gate;

  const [storage] = result.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={storage.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/storages/${id}/edit`),
          },
        ]}
      />
      <FormCard mode="view" data={storage} fields={storageFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
