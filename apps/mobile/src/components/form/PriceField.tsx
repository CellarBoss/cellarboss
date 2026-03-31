import { View, StyleSheet } from "react-native";
import { TextInput, HelperText } from "react-native-paper";
import { useSetting } from "@/hooks/use-settings";
import { theme } from "@/lib/theme";

type PriceFieldProps = {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  editable?: boolean;
  error?: string;
};

function getCurrencySymbol(currency: string): string {
  try {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? currency
    );
  } catch {
    return currency;
  }
}

export function PriceField({
  label,
  value,
  onChangeValue,
  editable = true,
  error,
}: PriceFieldProps) {
  const currencySetting = useSetting("currency");
  const currency = (currencySetting.data as string) || "USD";
  const symbol = getCurrencySymbol(currency);

  return (
    <View style={styles.field}>
      <TextInput
        testID={`field-${label.toLowerCase().replace(/\s+/g, "-")}`}
        label={label}
        value={value}
        onChangeText={(text) => {
          // Allow digits and at most one decimal point, max 2 decimal places
          const cleaned = text.replace(/[^0-9.]/g, "");
          const [whole, ...rest] = cleaned.split(".");
          if (rest.length === 0) {
            onChangeValue(cleaned);
          } else {
            onChangeValue(`${whole}.${rest.join("").slice(0, 2)}`);
          }
        }}
        mode="outlined"
        disabled={!editable}
        error={!!error}
        keyboardType="numeric"
        left={<TextInput.Affix text={symbol} />}
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
});
