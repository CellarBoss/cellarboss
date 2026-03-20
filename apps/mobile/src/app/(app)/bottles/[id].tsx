import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import type { FieldConfig } from "@/lib/types/field";
import type { Bottle } from "@cellarboss/types";
import {
  BOTTLE_STATUSES,
  BOTTLE_SIZES,
} from "@cellarboss/validators/constants";

function formatStatus(s: string) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const BOTTLE_SIZE_LABELS: Record<string, string> = {
  piccolo: "Piccolo (187ml)",
  half: "Half (375ml)",
  standard: "Standard (750ml)",
  litre: "Litre (1L)",
  magnum: "Magnum (1.5L)",
  "double-magnum": "Double Magnum (3L)",
  jeroboam: "Jeroboam (4.5L)",
  imperial: "Imperial (6L)",
  salmanazar: "Salmanazar (9L)",
  balthazar: "Balthazar (12L)",
  nebuchadnezzar: "Nebuchadnezzar (15L)",
};

function formatBottleSize(s: string) {
  return BOTTLE_SIZE_LABELS[s] ?? formatStatus(s);
}

const bottleFields: FieldConfig<Bottle>[] = [
  { key: "purchaseDate", label: "Purchase Date", type: "date" },
  {
    key: "purchasePrice",
    label: "Purchase Price",
    type: "number",
    numberProps: { min: 0, step: 0.01 },
  },
  { key: "vintageId", label: "Vintage", type: "number", editable: false },
  { key: "storageId", label: "Storage", type: "number" },
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
    <SafeAreaView style={styles.container} edges={["top"]}>
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
      <FormCard mode="view" data={bottle} fields={bottleFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
