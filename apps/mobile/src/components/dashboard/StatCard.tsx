import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { theme } from "@/lib/theme";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  onPress?: () => void;
};

export function StatCard({
  title,
  value,
  subtitle,
  color,
  onPress,
}: StatCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={[styles.accent, { backgroundColor: color }]} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  accent: {
    width: 28,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
});
