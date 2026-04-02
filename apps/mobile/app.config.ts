import { ExpoConfig, ConfigContext } from "expo/config";

const appVersion = process.env.APP_VERSION?.replace(/^v/, "") || "0.0.0";

function computeVersionCode(version: string): number {
  const [major = 0, minor = 0, patch = 0] = version
    .split(".")
    .map((n) => parseInt(n, 10));
  return major * 10000 + minor * 100 + patch || 1;
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "CellarBoss",
  slug: "cellarboss",
  version: appVersion,
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "cellarboss",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#FBF8F8",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "org.cellarboss.mobile",
    buildNumber: appVersion,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#F5E6EA",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    package: "org.cellarboss.mobile",
    versionCode: computeVersionCode(appVersion),
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    ["expo-router", { root: "./src/app" }],
    "expo-secure-store",
    "./plugins/with-network-security-config",
    "expo-image",
  ],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:5000",
    eas: {
      projectId: "5cf767f2-6255-43a9-81f0-6d987cb8a6f7",
    },
  },
});
