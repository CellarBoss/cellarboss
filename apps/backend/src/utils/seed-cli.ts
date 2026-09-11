import "dotenv/config";
import { Kysely } from "kysely";
import type { Database } from "@schema/database.js";
import { getDialect } from "./database";
import { logger } from "./logger.js";
import { runSeeds } from "./seed.js";

/**
 * CLI entry point for "pnpm seed"
 */
const db = new Kysely<Database>({ dialect: getDialect() });

runSeeds(db)
  .then(() => db.destroy())
  .catch(async (err) => {
    logger.withError(err).error("Seeding failed");
    await db.destroy();
    process.exit(1);
  });
