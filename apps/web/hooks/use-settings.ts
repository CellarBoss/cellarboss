"use client";

import { createSettingsHooks } from "@cellarboss/common/hooks/use-settings";
import { getSettings, updateSetting } from "@/lib/api/settings";

export type { SettingValueType } from "@cellarboss/common/settings";

const { useSettings, useSetting, useUpdateSetting } = createSettingsHooks(
  getSettings,
  updateSetting,
);

export { useSettings, useSetting, useUpdateSetting };
