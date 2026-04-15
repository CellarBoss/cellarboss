import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "bottles/index",
};

export default function CellarStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
