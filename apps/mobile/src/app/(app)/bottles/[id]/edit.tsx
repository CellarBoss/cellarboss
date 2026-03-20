import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { formatStatus, formatBottleSize } from "@/lib/functions/format";
import { theme } from "@/lib/theme";
import type { FieldConfig } from "@/lib/types/field";
import type { Bottle } from "@cellarboss/types";
import {
  BOTTLE_STATUSES,
  BOTTLE_SIZES,
} from "@cellarboss/validators/constants";

const bottleFields: FieldConfig<Bottle>[] = [
  { key: "purchaseDate", label: "Purchase Date", type: "date" },
  {
    key: "purchasePrice",
    label: "Purchase Price",
    type: "number",
    numberProps: { min: 0, step: 0.01 },
  },
  {
    key: "vintageId",
    label: "Vintage",
    type: "wine-vintage",
    editable: false,
  },
  {
    key: "storageId",
    label: "Storage",
    type: "selector",
    selectorConfig: {
      queryKey: "storages",
      queryFn: () => api.storages.getAll(),
      allowNone: true,
      hierarchical: true,
    },
  },
  {
    key: "status",
    label: "Status",
    type: "fixed-list",
    options: BOTTLE_STATUSES.map((s) => ({ value: s, label: formatStatus(s) })),
  },
  {
    key: "size",
    label: "Size",
    type: "fixed-list",
    options: BOTTLE_SIZES.map((s) => ({
      value: s,
      label: formatBottleSize(s),
    })),
  },
];

export default function EditBottleScreen() {
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
    <SafeAreaView style={styles.container} edges={["top"]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
