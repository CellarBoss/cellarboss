import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import {
  getThemePreference,
  setThemePreference as saveThemePreference,
  type ThemePreference,
} from "@/lib/auth/secure-store";
import { lightTheme, darkTheme, type AppTheme } from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  isDark: boolean;
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    getThemePreference().then((saved) => {
      if (saved) {
        setPreferenceState(saved);
      }
    });
  }, []);

  const setPreference = useCallback((newPreference: ThemePreference) => {
    setPreferenceState(newPreference);
    saveThemePreference(newPreference);
  }, []);

  const isDark =
    preference === "system"
      ? systemColorScheme === "dark"
      : preference === "dark";

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextValue = {
    preference,
    setPreference,
    isDark,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemePreference(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error(
      "useThemePreference must be used within <ThemePreferenceProvider>",
    );
  }
  return ctx;
}
