import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/hooks/use-app-theme";

type WineGlassRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  editable?: boolean;
};

export function WineGlassRating({
  value,
  onChange,
  editable = false,
}: WineGlassRatingProps) {
  const theme = useAppTheme();

  function handlePress(index: number) {
    if (!editable || !onChange) return;
    const newValue = index + 1 === value ? 0 : index + 1;
    Haptics.selectionAsync();
    onChange(newValue);
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 8,
    },
    glasses: {
      flexDirection: "row",
      gap: 2,
    },
    glassButton: {
      padding: 2,
    },
    glass: {
      fontSize: 20,
    },
    glassActive: {
      opacity: 1,
    },
    glassInactive: {
      opacity: 0.25,
    },
    label: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.glasses}>
        {Array.from({ length: 10 }, (_, i) => {
          const active = i < value;
          return (
            <Pressable
              key={i}
              onPress={() => handlePress(i)}
              disabled={!editable}
              style={styles.glassButton}
            >
              <Text
                style={[
                  styles.glass,
                  active ? styles.glassActive : styles.glassInactive,
                ]}
              >
                🍷
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.label}>{value}/10</Text>
    </View>
  );
}
