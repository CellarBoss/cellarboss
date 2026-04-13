import { useTheme } from "react-native-paper";
import type { AppTheme } from "@/lib/theme";

export function useAppTheme() {
  return useTheme<AppTheme>();
}
