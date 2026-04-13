import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";
import { useAppTheme } from "@/hooks/use-app-theme";

interface AddFABProps {
  onPress: () => void;
}

export function AddFAB({ onPress }: AddFABProps) {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    fab: {
      position: "absolute",
      right: 16,
      bottom: 16,
      backgroundColor: theme.colors.primary,
    },
  });

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
