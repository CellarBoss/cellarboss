import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Icon, Text } from "react-native-paper";
import { useAppTheme } from "@/hooks/use-app-theme";

type NoteBlockProps = {
  label: string;
  children?: string | null;
  style?: StyleProp<ViewStyle>;
};

export function NoteBlock({ label, children, style }: NoteBlockProps) {
  const theme = useAppTheme();
  const isBlank = !children || children.trim() === "";

  if (isBlank) return null;

  const styles = StyleSheet.create({
    section: {
      borderTopColor: theme.colors.outlineVariant,
      borderTopWidth: 1,
      paddingTop: 12,
    },
    header: {
      alignItems: "center",
      flexDirection: "row" as const,
      gap: 6,
      marginBottom: 6,
    },
    label: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: "600" as const,
    },
    text: {
      color: theme.colors.onSurface,
      lineHeight: 20,
    },
  });

  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        <Icon
          source="note-text-outline"
          size={14}
          color={theme.colors.onSurfaceVariant}
        />
        <Text variant="labelSmall" style={styles.label}>
          {label}
        </Text>
      </View>
      <Text variant="bodyMedium" style={styles.text}>
        {children}
      </Text>
    </View>
  );
}
