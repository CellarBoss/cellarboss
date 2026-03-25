import { View, StyleSheet } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { theme } from "@/lib/theme";

type Action = {
  icon: string;
  onPress: () => void;
};

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  actions?: Action[];
};

export function ScreenHeader({
  title,
  showBack = false,
  actions,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <IconButton
            testID="header-back-button"
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {actions && actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, i) => (
            <IconButton
              key={i}
              testID={`header-action-${action.icon}`}
              icon={action.icon}
              size={24}
              onPress={action.onPress}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
});
