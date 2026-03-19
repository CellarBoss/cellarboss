import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "CellarBoss",
  slug: "cellarboss",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "cellarboss",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.cellarboss.mobile",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    package: "com.cellarboss.mobile",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [["expo-router", { root: "./src/app" }], "expo-secure-store"],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:5000",
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
