"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import {
  DEFAULT_LANGUAGE,
  resolveLanguage,
  translate,
  type SupportedLanguage,
  type TranslationKey,
} from "@cellarboss/common/i18n";
import { useSettingsContext } from "@/contexts/settings-context";

type I18nContextValue = {
  language: SupportedLanguage;
  t: (key: TranslationKey) => string;
};

const fallbackContext: I18nContextValue = {
  language: DEFAULT_LANGUAGE,
  t: (key) => translate(DEFAULT_LANGUAGE, key),
};

const I18nContext = createContext<I18nContextValue>(fallbackContext);

export function I18nProvider({ children }: { children: ReactNode }) {
  const settings = useSettingsContext();
  const language = resolveLanguage(settings.get("language"));
  const t = useCallback(
    (key: TranslationKey) => translate(language, key),
    [language],
  );

  return (
    <I18nContext.Provider value={{ language, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
