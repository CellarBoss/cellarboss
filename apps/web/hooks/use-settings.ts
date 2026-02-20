"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, getSettingByKey, updateSetting } from "@/lib/api/settings";
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

export function useSettings(key?: string) {
  return useQuery({
    queryKey: key ? ["settings", key] : ["settings"],
    queryFn: async () => {
      if (key) {
        const result = await getSettingByKey(key);
        if (!result.ok) throw new Error(result.error.message);
        return new Map([[result.data.key, parseValue(result.data.value)]]);
      } else {
        const result = await getSettings();
        if (!result.ok) throw new Error(result.error.message);

        const map = new Map<string, SettingValueType>();
        result.data.forEach((setting: Setting) => {
          map.set(setting.key, parseValue(setting.value));
        });
        return map;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useSetting(key: string) {
  const query = useSettings(key);

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
