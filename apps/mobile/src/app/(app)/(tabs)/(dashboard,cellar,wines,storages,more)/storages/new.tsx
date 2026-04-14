import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { api } from "@/lib/api/client";
import { storageFields } from "@/lib/fields/storages";
import type { Storage } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function NewStorageScreen() {
  const commonStyles = useCommonStyles();
  const { locationId: locationIdParam } = useLocalSearchParams<{
    locationId?: string;
  }>();
  const queryClient = useQueryClient();

  const defaultData: Storage = {
    id: 0,
    name: "",
    locationId: locationIdParam ? Number(locationIdParam) : null,
    parent: null,
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Storage>> => {
    const result = await api.storages.create({
      id: 0,
      name: data.name,
      locationId: data.locationId ? Number(data.locationId) : null,
      parent: data.parent ? Number(data.parent) : null,
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["storages"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="New Storage" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={storageFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
