import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { api } from "@/lib/api/client";
import { bottleFields } from "@/lib/fields/bottles";
import type { FieldConfig } from "@/lib/types/field";
import type { ApiResult } from "@cellarboss/common";
import type { Bottle } from "@cellarboss/types";

type BottleCreateData = Bottle & { quantity: number };

const bottleCreateFields: FieldConfig<BottleCreateData>[] = [
  ...(bottleFields as FieldConfig<BottleCreateData>[]),
  {
    key: "quantity",
    label: "Quantity",
    type: "quantity-stepper",
  },
];

const defaultData: BottleCreateData = {
  id: 0,
  purchaseDate: new Date().toISOString().split("T")[0],
  purchasePrice: 0,
  vintageId: 0,
  storageId: null,
  status: "ordered",
  size: "standard",
  quantity: 1,
};

const processSave = async (
  data: Record<string, string>,
): Promise<ApiResult<BottleCreateData>> => {
  const quantity = Math.max(1, Number(data.quantity) || 1);
  const bottleData = {
    purchaseDate: data.purchaseDate,
    purchasePrice: Number(data.purchasePrice),
    vintageId: Number(data.vintageId),
    storageId: data.storageId ? Number(data.storageId) : null,
    status: data.status as Bottle["status"],
    size: data.size as Bottle["size"],
  };

  let lastResult = null;
  for (let i = 0; i < quantity; i++) {
    lastResult = await api.bottles.create(bottleData);
    if (!lastResult.ok) return lastResult;
  }
  return lastResult! as ApiResult<BottleCreateData>;
};

export default function NewBottleScreen() {
  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="New Bottle" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={bottleCreateFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
