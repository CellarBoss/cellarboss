#!/usr/bin/env ts-node

import type { Database } from "@schema/database.js";
import { db } from "./database";
import { execSync } from "child_process";
import process from "process";
import { sql, type Kysely } from "kysely";
import { cleanupOrphanedFiles, ensureUploadDirs } from "./upload.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

async function waitForDb() {
  let retries = 0;

  while (true) {
    try {
      await sql`SELECT 1`.execute(db);
      logger.info("Database is available");
      return db;
    } catch (err) {
      retries += 1;
      if (retries > env.DB_MAX_RETRIES) {
        logger
          .withError(err as Error)
          .error("Database not available after max retries");
        process.exit(1);
      }
      logger.withContext({ retry: retries }).warn("Waiting for database...");
      await new Promise((resolve) =>
        setTimeout(resolve, env.DB_RETRY_INTERVAL),
      );
    }
  }
}

async function checkAndSeed(db: Kysely<Database>) {
  try {
    const countResult = await db
      .selectFrom("setting")
      .select(db.fn.countAll().as("count"))
      .executeTakeFirst();

    const count = Number(countResult?.count || 0);

    if (count === 0) {
      logger.info("Database empty, running seeders");
      execSync("kysely seed run", { stdio: "inherit" });
    } else {
      logger.debug("Database already seeded");
    }
  } catch (err) {
    logger.withError(err as Error).error("Error checking/seeding database");
    process.exit(1);
  }
}

async function runMigrations() {
  try {
    logger.info("Running Kysely migrations");
    execSync("kysely migrate latest", { stdio: "inherit" });

    logger.info("Running better-auth migrations");
    try {
      execSync("better-auth migrate --yes --config ./dist/src/utils/auth.js", {
        stdio: "inherit",
      });
    } catch {
      logger.warn("better-auth migrations may have nothing to do, skipping");
    }
  } catch (err) {
    logger.withError(err as Error).error("Error running migrations");
    process.exit(1);
  }
}

function startServer() {
  logger.withContext({ port: env.PORT }).info("Starting API server");
  try {
    execSync(`node dist/src/index.js`, { stdio: "inherit" });
  } catch (err) {
    logger.withError(err as Error).error("Server exited with an error");
    process.exit(1);
  }
}

async function cleanupImages(db: Kysely<Database>) {
  try {
    const rows = await (db as Kysely<any>)
      .selectFrom("image")
      .select("filename")
      .execute();
    const validFilenames = new Set<string>(
      rows.map((r: { filename: string }) => r.filename),
    );
    await cleanupOrphanedFiles(validFilenames);
  } catch (err) {
    // image table may not exist yet on first run — migrations will create it
    logger.withError(err as Error).warn("Image orphan cleanup skipped");
  }
}

async function main() {
  const db = await waitForDb();
  await runMigrations();
  await checkAndSeed(db);
  await ensureUploadDirs();
  await cleanupImages(db);
  startServer();
}

main();
