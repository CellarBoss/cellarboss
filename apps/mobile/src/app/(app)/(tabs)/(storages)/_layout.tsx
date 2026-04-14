import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "storages/index",
};

export default function StoragesStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
