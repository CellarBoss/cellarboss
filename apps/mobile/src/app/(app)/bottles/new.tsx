import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { api } from "@/lib/api/client";
import { bottleFields } from "@/lib/fields/bottles";
import { theme } from "@/lib/theme";
import type { Bottle } from "@cellarboss/types";

const defaultData: Bottle = {
  id: 0,
  purchaseDate: new Date().toISOString().split("T")[0],
  purchasePrice: 0,
  vintageId: 0,
  storageId: null,
  status: "ordered",
  size: "standard",
};

const processSave = async (data: Record<string, string>) => {
  return api.bottles.create({
    purchaseDate: data.purchaseDate,
    purchasePrice: Number(data.purchasePrice),
    vintageId: Number(data.vintageId),
    storageId: data.storageId ? Number(data.storageId) : null,
    status: data.status as Bottle["status"],
    size: data.size as Bottle["size"],
  });
};

export default function NewBottleScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="New Bottle" showBack />
      <FormCard
        mode="create"
        data={defaultData}
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
