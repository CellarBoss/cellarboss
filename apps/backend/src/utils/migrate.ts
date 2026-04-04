import "dotenv/config";
import { logger } from "./logger.js";
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
    logger.info("Running migrations to latest");
    result = await migrator.migrateToLatest();
  } else if (command === "down") {
    logger.info("Reverting last migration");
    result = await migrator.migrateDown();
  } else {
    logger.withContext({ command }).error("Unknown migrate command");
    await db.destroy();
    process.exit(1);
  }

  const { error, results } = result;

  results?.forEach((r) => {
    if (r.status === "Success") {
      logger
        .withContext({ direction: r.direction, migration: r.migrationName })
        .info("Migration applied");
    } else if (r.status === "Error") {
      logger
        .withContext({ migration: r.migrationName })
        .error("Migration failed");
    }
  });

  if (!results?.length) {
    logger.info("No migrations to run");
  }

  await db.destroy();

  if (error) {
    logger.withError(error as Error).error("Migration failed");
    process.exit(1);
  }
}

run().catch((err) => {
  logger.withError(err).error("Unexpected error during migration");
  process.exit(1);
});
