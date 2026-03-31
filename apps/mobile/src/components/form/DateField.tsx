import { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { TextInput, HelperText } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { theme } from "@/lib/theme";

type DateFieldProps = {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  editable?: boolean;
  error?: string;
};

export function DateField({
  label,
  value,
  onChangeValue,
  editable = true,
  error,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const dateValue = value ? new Date(value + "T00:00:00") : undefined;

  return (
    <View style={styles.field}>
      <Pressable
        testID={`field-${label.toLowerCase().replace(/\s+/g, "-")}`}
        onPress={() => editable && setOpen(true)}
      >
        <TextInput
          label={label}
          value={value}
          mode="outlined"
          disabled={!editable}
          error={!!error}
          editable={false}
          pointerEvents="none"
          right={<TextInput.Icon icon="calendar" />}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />
      </Pressable>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={() => setOpen(false)}
        date={dateValue}
        onConfirm={({ date }) => {
          setOpen(false);
          if (date) {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            onChangeValue(`${yyyy}-${mm}-${dd}`);
          }
        }}
      />
      {error && <HelperText type="error">{error}</HelperText>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
});
