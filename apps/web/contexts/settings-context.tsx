"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSettings } from "@/hooks/use-settings";
import { type SettingValueType } from "@/lib/constants/settings";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

const SettingsContext = createContext<Map<string, SettingValueType> | null>(
  null,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settingsQuery = useSettings();

  if (settingsQuery.isLoading) {
    return <LoadingCard />;
  }

  if (settingsQuery.error) {
    return <ErrorCard message={settingsQuery.error.apiError.message} />;
  }

  if (!settingsQuery.data) {
    return <ErrorCard message="Unexpected error: no settings data received" />;
  }

  return (
    <SettingsContext.Provider value={settingsQuery.data}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext(): Map<string, SettingValueType> {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error(
      "useSettingsContext must be used within a SettingsProvider",
    );
  }
  return context;
}
