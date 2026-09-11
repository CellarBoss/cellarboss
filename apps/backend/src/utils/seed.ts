import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import type { Kysely } from "kysely";
import {
  Migrator,
  type Migration,
  type MigrationProvider,
} from "kysely/migration";
import type { Database } from "@schema/database.js";
import { logger } from "./logger.js";

// kysely-ctl's seeder has no ledger and re-runs every file, so Kysely's Migrator is pointed at the seeds folder with its own tracking tables instead.

const SEED_TABLE = "seed_history";
const SEED_LOCK_TABLE = "seed_history_lock";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface SeedModule {
  seed: (db: Kysely<any>) => Promise<void>;
}

class SeedProvider implements MigrationProvider {
  constructor(private readonly seedFolder: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const seeds: Record<string, Migration> = {};
    const files = await fs.readdir(this.seedFolder);

    for (const fileName of files.sort()) {
      if (!/\.(ts|js)$/.test(fileName) || fileName.endsWith(".d.ts")) continue;

      const seedName = fileName.replace(/\.(ts|js)$/, "");
      // pathToFileURL: bare Windows paths are not valid ESM specifiers.
      const fileUrl = pathToFileURL(path.join(this.seedFolder, fileName)).href;
      const module = (await import(fileUrl)) as SeedModule;

      if (typeof module.seed !== "function") {
        throw new Error(`Seed "${fileName}" does not export a seed() function`);
      }

      seeds[seedName] = { up: module.seed };
    }

    return seeds;
  }
}

export function createSeeder(db: Kysely<Database>, seedFolder?: string) {
  return new Migrator({
    db: db as Kysely<any>,
    provider: new SeedProvider(
      seedFolder ?? path.resolve(__dirname, "../seeds"),
    ),
    migrationTableName: SEED_TABLE,
    migrationLockTableName: SEED_LOCK_TABLE,
    disableTransactions: true,
  });
}

/** Applies any seeds not yet recorded in the ledger. Throws on failure. */
export async function runSeeds(
  db: Kysely<Database>,
  seedFolder?: string,
): Promise<void> {
  const { error, results } = await createSeeder(
    db,
    seedFolder,
  ).migrateToLatest();

  for (const result of results ?? []) {
    if (result.status === "Success") {
      logger.withContext({ seed: result.migrationName }).info("Seed applied");
    } else if (result.status === "Error") {
      logger.withContext({ seed: result.migrationName }).error("Seed failed");
    }
  }

  if (error) throw error;

  if (!results?.length) {
    logger.debug("No new seeds to apply");
  }
}
