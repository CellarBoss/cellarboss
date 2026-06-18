"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePreferences } from "@/hooks/use-preferences";
import { queryGate } from "@/lib/functions/query-gate";

const emptyMap = new Map<string, string>();

const PreferencesContext = createContext<Map<string, string>>(emptyMap);

/**
 * Loads user preferences once and blocks its children until they are available.
 *
 * Gating here means the preferences cache is always warm before any DataTable
 * mounts, so saved column visibility/order applies synchronously on the first
 * render (no two-stage load or layout jump). It also removes the need for every
 * list page to add `usePreferences()` to its own queryGate.
 *
 * Scope this to the authenticated subtree only — the preferences API requires a
 * session, so wrapping unauthenticated pages would gate them on a 401.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const preferencesQuery = usePreferences();
  const result = queryGate([preferencesQuery]);
  if (!result.ready) return result.gate;

  return (
    <PreferencesContext.Provider value={result.data[0]}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferencesContext(): Map<string, string> {
  return useContext(PreferencesContext);
}
