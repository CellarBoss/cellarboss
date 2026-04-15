import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "wines/index",
};

export default function WinesStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
