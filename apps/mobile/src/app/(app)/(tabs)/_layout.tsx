import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";
import { theme } from "@/lib/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarActiveBackgroundColor: theme.colors.surfaceVariant,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          borderTopColor: theme.colors.outlineVariant,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarButtonTestID: "dashboard-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cellar"
        options={{
          title: "Cellar",
          tabBarButtonTestID: "cellar-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="bottle-wine-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wines"
        options={{
          title: "Wines",
          tabBarButtonTestID: "wines-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="glass-wine" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="storages"
        options={{
          title: "Storages",
          tabBarButtonTestID: "storages-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="warehouse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarButtonTestID: "more-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="dots-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
