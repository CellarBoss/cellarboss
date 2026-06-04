import {
  CommonActions,
  NavigationProp,
  ParamListBase,
  Route,
} from "@react-navigation/native";
import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useI18n } from "@/contexts/i18n-context";

// Tab folders are groups like `(cellar)`, `(wines)`, so detail routes can be
// shared across every tab via the `(dashboard,cellar,wines,storages,more)/`
// group. Navigating to e.g. `/winemakers/3` resolves within the active tab and
// pushes onto that tab's stack, so the tab bar stays visible and back returns
// to the previous page on the same tab.

function resetTabOnPress({
  navigation,
  route,
}: {
  navigation: NavigationProp<ParamListBase>;
  route: Route<string>;
}) {
  return {
    tabPress: (e: { preventDefault: () => void }) => {
      e.preventDefault();
      const state = navigation.getState();
      const tabIndex = state.routes.findIndex(
        (r: Route<string>) => r.key === route.key,
      );
      navigation.dispatch(
        CommonActions.reset({
          ...state,
          index: tabIndex,
          routes: state.routes.map((r: Route<string>) =>
            r.key === route.key ? { key: r.key, name: r.name } : r,
          ),
        }),
      );
    },
  };
}

export default function TabLayout() {
  const theme = useAppTheme();
  const { t } = useI18n();

  return (
    <Tabs
      backBehavior="history"
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
        name="(dashboard)"
        listeners={resetTabOnPress}
        options={{
          title: t("nav.dashboard"),
          tabBarButtonTestID: "dashboard-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(cellar)"
        listeners={resetTabOnPress}
        options={{
          title: t("nav.cellar"),
          tabBarButtonTestID: "cellar-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="bottle-wine-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(wines)"
        listeners={resetTabOnPress}
        options={{
          title: t("nav.wines"),
          tabBarButtonTestID: "wines-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="glass-wine" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(storages)"
        listeners={resetTabOnPress}
        options={{
          title: t("nav.storages"),
          tabBarButtonTestID: "storages-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="warehouse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(more)"
        listeners={resetTabOnPress}
        options={{
          title: t("nav.more"),
          tabBarButtonTestID: "more-tab",
          tabBarIcon: ({ color, size }) => (
            <Icon source="dots-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
