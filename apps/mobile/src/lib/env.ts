import Constants from "expo-constants";

interface MobileEnv {
  apiBaseUrl: string;
}

function getEnv(): MobileEnv {
  const extra = Constants.expoConfig?.extra;

  return {
    apiBaseUrl: extra?.apiBaseUrl ?? "http://localhost:5000",
  };
}

export const mobileEnv = getEnv();
