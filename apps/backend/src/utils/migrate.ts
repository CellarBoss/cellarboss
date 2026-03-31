import "dotenv/config";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promises as fs } from "node:fs";
import {
  Kysely,
  Migrator,
  type Migration,
  type MigrationProvider,
} from "kysely";
import { getDialect } from "./database";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "../migrations");

// Custom provider that uses pathToFileURL to fix Windows ESM absolute path issue.
// Node.js ESM requires file:// URLs; bare Windows paths (C:\...) are rejected.
const provider: MigrationProvider = {
  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const files = (await fs.readdir(migrationsDir)).sort();

    for (const fileName of files) {
      if (fileName.endsWith(".ts") || fileName.endsWith(".js")) {
        const filePath = path.join(migrationsDir, fileName);
        const migration = await import(pathToFileURL(filePath).href);
        const migrationName = fileName.replace(/\.(ts|js)$/, "");
        migrations[migrationName] = migration;
      }
    }

    return migrations;
  },
};

const db = new Kysely<any>({ dialect: getDialect() });
const migrator = new Migrator({ db, provider });

const command = process.argv[2] ?? "latest";

async function run() {
  let result;

  if (command === "latest") {
    console.log("Running migrations to latest...");
    result = await migrator.migrateToLatest();
  } else if (command === "down") {
    console.log("Reverting last migration...");
    result = await migrator.migrateDown();
  } else {
    console.error(`Unknown command: ${command}`);
    await db.destroy();
    process.exit(1);
  }

  const { error, results } = result;

  results?.forEach((r) => {
    if (r.status === "Success") {
      console.log(`✓ ${r.direction} "${r.migrationName}"`);
    } else if (r.status === "Error") {
      console.error(`✗ Failed "${r.migrationName}"`);
    }
  });

  if (!results?.length) {
    console.log("No migrations to run.");
  }

  await db.destroy();

  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
