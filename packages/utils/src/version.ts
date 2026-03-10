import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

export function getVersion(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const rootPkg = JSON.parse(
    readFileSync(resolve(__dirname, "../../../package.json"), "utf-8"),
  );
  return rootPkg.version ?? "0.0.0";
}
