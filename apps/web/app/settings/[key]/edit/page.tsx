"use client";

import { useParams } from "next/navigation";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { GenericCard } from "@/components/cards/GenericCard";
import { settingFields, type SettingFormData } from "@/lib/fields/settings";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";
import { useQueryClient } from "@tanstack/react-query";
import { type ParsedSettingsMap } from "@/lib/constants/settings";

export default function EditSettingPage() {
  const params = useParams();
  const key = decodeURIComponent(params.key as string);

  const settingsQuery = useSettings();
  const updateMutation = useUpdateSetting();
  const queryClient = useQueryClient();

  if (settingsQuery.isLoading) {
    return <LoadingCard />;
  }

  if (settingsQuery.isError) {
    return <ErrorCard message={settingsQuery.error?.message || "Failed to load settings"} />;
  }

  const settings = settingsQuery.data as ParsedSettingsMap;
  const settingValue = settings.get(key);

  if (settingValue === undefined) {
    return <ErrorCard message={`Setting '${key}' not found`} />;
  }

  const settingData: SettingFormData = {
    id: 0,
    key,
    value: String(settingValue ?? ""),
  };

  async function handleUpdate(data: SettingFormData): Promise<ApiResult<SettingFormData>> {
    try {
      await updateMutation.mutateAsync({
        key: data.key,
        value: data.value,
      });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      return { ok: true, data };
    } catch (error: unknown) {
      return {
        ok: false,
        error: {
          message: error instanceof Error ? error.message : "Failed to update setting",
          status: 500,
        },
      };
    }
  }

  return (
    <section>
      <PageHeader title="Edit Setting" />
      <GenericCard<SettingFormData>
        mode="edit"
        data={settingData}
        fields={settingFields}
        processSave={handleUpdate}
        redirectTo="/settings"
      />
    </section>
  );
}
