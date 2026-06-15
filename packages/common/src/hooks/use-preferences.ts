import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "./use-api-query";
import type { ApiResult } from "../types";
import type { Preference } from "@cellarboss/types";

type PreferencesFetcher = () => Promise<ApiResult<Preference[]>>;
type PreferenceUpserter = (
  key: string,
  value: string,
) => Promise<ApiResult<Preference>>;
type PreferenceRemover = (
  key: string,
) => Promise<ApiResult<{ success: boolean }>>;

export function createPreferencesHooks(
  fetchPreferences: PreferencesFetcher,
  upsertPreference: PreferenceUpserter,
  removePreference: PreferenceRemover,
) {
  function usePreferences() {
    return useApiQuery<Map<string, string>>({
      queryKey: ["preferences"],
      queryFn: async () => {
        const result = await fetchPreferences();
        if (!result.ok) return result;

        const map = new Map<string, string>();
        result.data.forEach((pref: Preference) => {
          map.set(pref.key, pref.value);
        });
        return { ok: true as const, data: map };
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }

  function usePreference(key: string) {
    const query = usePreferences();

    return {
      data: query.data?.get(key),
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
    };
  }

  function useUpsertPreference() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ key, value }: { key: string; value: string }) => {
        const result = await upsertPreference(key, value);
        if (!result.ok) throw new Error(result.error.message);
        return result.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["preferences"] });
      },
    });
  }

  function useRemovePreference() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (key: string) => {
        const result = await removePreference(key);
        if (!result.ok) throw new Error(result.error.message);
        return result.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["preferences"] });
      },
    });
  }

  return {
    usePreferences,
    usePreference,
    useUpsertPreference,
    useRemovePreference,
  };
}
