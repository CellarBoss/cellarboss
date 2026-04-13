import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { bottleFields } from "@/lib/fields/bottles";
import type { Bottle } from "@cellarboss/types";

export default function EditBottleScreen() {
  const commonStyles = useCommonStyles();
  const { id } = useLocalSearchParams<{ id: string }>();

  const bottleQuery = useApiQuery({
    queryKey: ["bottles", Number(id)],
    queryFn: () => api.bottles.getById(Number(id)),
  });

  const result = queryGate([bottleQuery]);
  if (!result.ready) return result.gate;

  const [bottle] = result.data;

  const processSave = async (data: Record<string, string>) => {
    return api.bottles.update({
      id: Number(id),
      purchaseDate: data.purchaseDate,
      purchasePrice: Number(data.purchasePrice),
      vintageId: Number(data.vintageId),
      storageId: data.storageId ? Number(data.storageId) : null,
      status: data.status as Bottle["status"],
      size: data.size as Bottle["size"],
    });
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="Edit Bottle" showBack />
      <FormCard
        mode="edit"
        data={bottle}
        fields={bottleFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
