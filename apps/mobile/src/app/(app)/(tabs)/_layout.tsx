import {
  CommonActions,
  NavigationProp,
  ParamListBase,
  Route,
} from "@react-navigation/native";
import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@/hooks/use-app-theme";
import { VersionMismatchBanner } from "@/components/VersionMismatchBanner";

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

  return (
    <>
      <VersionMismatchBanner />
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
          listeners={resetTabOnPress}
          options={{
            title: "Dashboard",
            tabBarButtonTestID: "dashboard-tab",
            tabBarIcon: ({ color, size }) => (
              <Icon source="view-dashboard-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bottles"
          listeners={resetTabOnPress}
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
          listeners={resetTabOnPress}
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
          listeners={resetTabOnPress}
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
          listeners={resetTabOnPress}
          options={{
            title: "More",
            tabBarButtonTestID: "more-tab",
            tabBarIcon: ({ color, size }) => (
              <Icon source="dots-horizontal" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="countries" options={{ href: null }} />
        <Tabs.Screen name="grapes" options={{ href: null }} />
        <Tabs.Screen name="locations" options={{ href: null }} />
        <Tabs.Screen name="regions" options={{ href: null }} />
        <Tabs.Screen name="tasting-notes" options={{ href: null }} />
        <Tabs.Screen name="vintages" options={{ href: null }} />
        <Tabs.Screen name="winemakers" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </>
  );
}
