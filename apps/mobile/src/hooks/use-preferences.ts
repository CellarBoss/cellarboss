import { createPreferencesHooks } from "@cellarboss/common/hooks/use-preferences";
import { api } from "@/lib/api/client";

const {
  usePreferences,
  usePreference,
  useUpsertPreference,
  useRemovePreference,
} = createPreferencesHooks(
  () => api.preferences.getAll(),
  (key, value) => api.preferences.upsert(key, value),
  (key) => api.preferences.remove(key),
);

export {
  usePreferences,
  usePreference,
  useUpsertPreference,
  useRemovePreference,
};
