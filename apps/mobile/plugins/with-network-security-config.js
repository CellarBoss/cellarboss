const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require("expo/config-plugins");
const path = require("path");
const fs = require("fs");

const NETWORK_SECURITY_CONFIG_XML = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false" />
  <domain-config cleartextTrafficPermitted="true">
    <!-- Android emulator host loopback (for E2E tests) -->
    <domain includeSubdomains="false">10.0.2.2</domain>
    <domain includeSubdomains="false">localhost</domain>
  </domain-config>
</network-security-config>
`;

/**
 * Expo config plugin that adds a network security config allowing cleartext
 * HTTP only to the Android emulator loopback address (10.0.2.2) and localhost.
 * All other traffic requires HTTPS.
 */
function withNetworkSecurityConfig(config) {
  // Step 1: Write the XML file into android/app/src/main/res/xml/
  config = withDangerousMod(config, [
    "android",
    async (cfg) => {
      const xmlDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(
        path.join(xmlDir, "network_security_config.xml"),
        NETWORK_SECURITY_CONFIG_XML,
      );
      return cfg;
    },
  ]);

  // Step 2: Reference it from the AndroidManifest
  config = withAndroidManifest(config, (cfg) => {
    const mainApplication =
      AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    mainApplication.$["android:networkSecurityConfig"] =
      "@xml/network_security_config";
    return cfg;
  });

  return config;
}

module.exports = withNetworkSecurityConfig;
