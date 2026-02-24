import { defineConfig } from "tsup";
import { readdirSync } from "fs";

function dirEntries(dir: string) {
  return Object.fromEntries(
    readdirSync(`./${dir}`)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => [`${dir}/${f.replace(".ts", "")}`, `${dir}/${f}`]),
  );
}

export default defineConfig({
  entry: {
    "src/index": "src/index.ts",
    "src/utils/startup": "src/utils/startup.ts",
    "src/utils/database": "src/utils/database.ts",
    "src/utils/auth": "src/utils/auth.ts",
    ...dirEntries("src/migrations"),
    ...dirEntries("src/seeds"),
  },
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  splitting: false,
  clean: true,
  noExternal: ["@cellarboss/types", "@cellarboss/validators"],
});
