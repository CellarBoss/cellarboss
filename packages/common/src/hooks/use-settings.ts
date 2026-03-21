import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "./use-api-query";
import type { ApiResult } from "../types";
import type { Setting } from "@cellarboss/types";
import { type SettingValueType, parseValue } from "../settings";

type SettingsFetcher = () => Promise<ApiResult<Setting[]>>;
type SettingUpdater = (
  key: string,
  value: string,
) => Promise<ApiResult<Setting>>;

export function createSettingsHooks(
  fetchSettings: SettingsFetcher,
  updateSetting: SettingUpdater,
) {
  function useSettings() {
    return useApiQuery<Map<string, SettingValueType>>({
      queryKey: ["settings"],
      queryFn: async () => {
        const result = await fetchSettings();
        if (!result.ok) return result;

        const map = new Map<string, SettingValueType>();
        result.data.forEach((setting: Setting) => {
          map.set(setting.key, parseValue(setting.value));
        });
        return { ok: true as const, data: map };
      },
      staleTime: 1000 * 60 * 60, // 1 hour
    });
  }

  function useSetting(key: string) {
    const query = useSettings();

    return {
      data: query.data?.get(key),
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
    };
  }

  function useUpdateSetting() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({
        key,
        value,
      }: {
        key: string;
        value: SettingValueType;
      }) => {
        const result = await updateSetting(key, String(value));
        if (!result.ok) throw new Error(result.error.message);
        return result.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      },
    });
  }

  return { useSettings, useSetting, useUpdateSetting };
}
