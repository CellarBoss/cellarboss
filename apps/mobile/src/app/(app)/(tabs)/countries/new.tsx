import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { api } from "@/lib/api/client";
import { countryFields } from "@/lib/fields/countries";
import type { Country } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function NewCountryScreen() {
  const commonStyles = useCommonStyles();
  const queryClient = useQueryClient();

  const defaultData: Country = {
    id: 0,
    name: "",
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<Country>> => {
    const result = await api.countries.create({
      id: 0,
      name: data.name,
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="New Country" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={countryFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
