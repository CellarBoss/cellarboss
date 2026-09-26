import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import expoConfig from "eslint-config-expo/flat.js";

const eslintConfig = defineConfig([
  ...fixupConfigRules(expoConfig),
  {
    rules: {
      "react/no-children-prop": "warn",
    },
  },
  globalIgnores([
    "dist/**",
    "coverage/**",
    "android/**",
    "ios/**",
    ".expo/**",
    "**/.vitepress/**",
  ]),
]);

export default eslintConfig;
