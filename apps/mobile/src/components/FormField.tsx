import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, HelperText, Menu, Button, Text } from "react-native-paper";
import { WineGlassRating } from "./WineGlassRating";
import { theme } from "@/lib/theme";
import type { SelectOption } from "@/lib/types/field";

type FormFieldProps = {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  type?:
    | "text"
    | "textarea"
    | "password"
    | "number"
    | "date"
    | "fixed-list"
    | "wine-rating";
  editable?: boolean;
  error?: string;
  options?: SelectOption[];
  numberProps?: { min?: number; max?: number; step?: number };
};

export function FormField({
  label,
  value,
  onChangeValue,
  type = "text",
  editable = true,
  error,
  options,
  numberProps,
}: FormFieldProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  if (type === "wine-rating") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <WineGlassRating
          value={Number(value) || 0}
          onChange={(v) => onChangeValue(String(v))}
          editable={editable}
        />
        {error && <HelperText type="error">{error}</HelperText>}
      </View>
    );
  }

  if (type === "fixed-list" && options) {
    const selectedLabel =
      options.find((o) => o.value === value)?.label ?? "Select...";

    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Menu
          visible={menuVisible && editable}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              testID={`field-${label.toLowerCase().replace(/\s+/g, "-")}`}
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              disabled={!editable}
              contentStyle={styles.menuButtonContent}
              style={styles.menuButton}
            >
              {selectedLabel}
            </Button>
          }
        >
          {options.map((option) => (
            <Menu.Item
              key={option.value}
              title={option.label}
              onPress={() => {
                onChangeValue(option.value);
                setMenuVisible(false);
              }}
            />
          ))}
        </Menu>
        {error && <HelperText type="error">{error}</HelperText>}
      </View>
    );
  }

  if (type === "date") {
    return (
      <View style={styles.field}>
        <TextInput
          testID={`field-${label.toLowerCase().replace(/\s+/g, "-")}`}
          label={label}
          value={value}
          onChangeText={onChangeValue}
          mode="outlined"
          disabled={!editable}
          error={!!error}
          placeholder="YYYY-MM-DD"
          keyboardType="default"
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />
        {error && <HelperText type="error">{error}</HelperText>}
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <TextInput
        testID={`field-${label.toLowerCase().replace(/\s+/g, "-")}`}
        label={label}
        value={value}
        onChangeText={onChangeValue}
        mode="outlined"
        disabled={!editable}
        error={!!error}
        secureTextEntry={type === "password"}
        keyboardType={type === "number" ? "numeric" : "default"}
        multiline={type === "textarea"}
        numberOfLines={type === "textarea" ? 4 : 1}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
      />
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
  menuButton: {
    borderColor: theme.colors.outline,
  },
  menuButtonContent: {
    justifyContent: "flex-start",
  },
});
