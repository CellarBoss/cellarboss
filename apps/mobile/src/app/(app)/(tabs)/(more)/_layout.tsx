import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "more",
};

export default function MoreStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
