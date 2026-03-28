import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";
import { theme } from "@/lib/theme";

interface AddFABProps {
  onPress: () => void;
}

export function AddFAB({ onPress }: AddFABProps) {
  return (
    <FAB
      testID="fab-add"
      icon="plus"
      color="white"
      style={styles.fab}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
