import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { api } from "@/lib/api/client";
import { grapeFields } from "@/lib/fields/grapes";
import type { Grape } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function NewGrapeScreen() {
  const queryClient = useQueryClient();

  const defaultData: Grape = {
    id: 0,
    name: "",
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Grape>> => {
    const result = await api.grapes.create({
      id: 0,
      name: data.name,
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["grapes"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="New Grape" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={grapeFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
