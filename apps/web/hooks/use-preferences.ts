"use client";

import { createPreferencesHooks } from "@cellarboss/common/hooks/use-preferences";
import {
  getPreferences,
  upsertPreference,
  removePreference,
} from "@/lib/api/preferences";

const {
  usePreferences,
  usePreference,
  useUpsertPreference,
  useRemovePreference,
} = createPreferencesHooks(getPreferences, upsertPreference, removePreference);

export {
  usePreferences,
  usePreference,
  useUpsertPreference,
  useRemovePreference,
};
