"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/use-api-query";
import { getSettings, updateSetting } from "@/lib/api/settings";
import type { Setting } from "@cellarboss/types";
import { type SettingValueType } from "@/lib/constants/settings";

function parseValue(value: string): SettingValueType {
  if (value === "null" || value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;

  if (!isNaN(Number(value)) && value !== "") {
    return Number(value);
  }

  return value;
}

export function useSettings() {
  return useApiQuery<Map<string, SettingValueType>>({
    queryKey: ["settings"],
    queryFn: async () => {
      const result = await getSettings();
      if (!result.ok) return result;

      const map = new Map<string, SettingValueType>();
      result.data.forEach((setting: Setting) => {
        map.set(setting.key, parseValue(setting.value));
      });
      return { ok: true, data: map };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useSetting(key: string) {
  const query = useSettings();

  return {
    data: query.data?.get(key),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: SettingValueType }) => {
      const result = await updateSetting(key, String(value));
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
