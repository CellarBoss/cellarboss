import { createSettingsHooks } from "@cellarboss/common/hooks/use-settings";
import { api } from "@/lib/api/client";

export type { SettingValueType } from "@cellarboss/common/settings";

const { useSettings, useSetting, useUpdateSetting } = createSettingsHooks(
  () => api.settings.getAll(),
  (key, value) => api.settings.update(key, value),
);

export { useSettings, useSetting, useUpdateSetting };
