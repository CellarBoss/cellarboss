"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSettings } from "@/hooks/use-settings";
import { type SettingValueType } from "@/lib/constants/settings";

const emptyMap = new Map<string, SettingValueType>();

const SettingsContext = createContext<Map<string, SettingValueType>>(emptyMap);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settingsQuery = useSettings();

  return (
    <SettingsContext.Provider value={settingsQuery.data ?? emptyMap}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext(): Map<string, SettingValueType> {
  return useContext(SettingsContext);
}
