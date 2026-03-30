import { View, TouchableOpacity, StyleSheet } from "react-native";
import { HelperText, Text } from "react-native-paper";
import { theme } from "@/lib/theme";

type QuantityStepperProps = {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  editable?: boolean;
  error?: string;
};

export function QuantityStepper({
  label,
  value,
  onChangeValue,
  editable = true,
  error,
}: QuantityStepperProps) {
  const qty = Number(value) || 1;
  const set = (n: number) => onChangeValue(String(Math.max(1, n)));

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => set(qty - 1)}
          disabled={!editable}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{qty}</Text>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => set(qty + 1)}
          disabled={!editable}
        >
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stepperShortcuts}>
        {[1, 3, 6, 12].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.shortcut, qty === n && styles.shortcutActive]}
            onPress={() => set(n)}
            disabled={!editable}
          >
            <Text
              style={[
                styles.shortcutText,
                qty === n && styles.shortcutTextActive,
              ]}
            >
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <HelperText type="error">{error}</HelperText>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 22,
    color: theme.colors.onSurface,
    lineHeight: 26,
  },
  stepperValue: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.onSurface,
    minWidth: 40,
    textAlign: "center",
  },
  stepperShortcuts: {
    flexDirection: "row",
    gap: 8,
  },
  shortcut: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  shortcutText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  shortcutTextActive: {
    color: theme.colors.onPrimary,
    fontWeight: "600",
  },
});
