import { skipToken, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JsonValue } from "@cellarboss/types";
import { useApiQuery } from "./use-api-query";
import {
  deletePreference,
  getPreference,
  updatePreference,
} from "@/lib/api/preferences";

export function preferenceQueryKey(key: string) {
  return ["preferences", key] as const;
}

export function usePreference<TValue extends JsonValue = JsonValue>(
  key: string | null,
) {
  return useApiQuery({
    queryKey: key ? preferenceQueryKey(key) : ["preferences", "disabled"],
    queryFn: key ? () => getPreference<TValue>(key) : skipToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdatePreference<TValue extends JsonValue = JsonValue>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: TValue }) => {
      const result = await updatePreference(key, value);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (preference, { key }) => {
      queryClient.setQueryData(preferenceQueryKey(key), preference);
    },
  });
}

export function useDeletePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const result = await deletePreference(key);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_deleted, key) => {
      queryClient.setQueryData(preferenceQueryKey(key), null);
    },
  });
}
