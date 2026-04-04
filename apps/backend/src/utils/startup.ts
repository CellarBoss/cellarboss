#!/usr/bin/env ts-node

import type { Database } from "@schema/database.js";
import { db } from "./database";
import { execSync } from "child_process";
import process from "process";
import { sql, type Kysely } from "kysely";
import { cleanupOrphanedFiles, ensureUploadDirs } from "./upload.js";
import { env } from "./env.js";

async function waitForDb() {
  let retries = 0;

  while (true) {
    try {
      await sql`SELECT 1`.execute(db);
      console.log("Database is available");
      return db;
    } catch (err) {
      retries += 1;
      if (retries > env.DB_MAX_RETRIES) {
        console.error("Database not available after max retries:", err);
        process.exit(1);
      }
      console.log(`Waiting for database... retry ${retries}`);
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
      console.log("Database empty. Running seeders...");
      execSync("kysely seed run", { stdio: "inherit" });
    } else {
      console.log("Database already seeded.");
    }
  } catch (err) {
    console.error("Error checking/seeding database:", err);
    process.exit(1);
  }
}

async function runMigrations() {
  try {
    console.log("Running Kysely migrations...");
    execSync("kysely migrate latest", { stdio: "inherit" });

    console.log("Running better-auth migrations...");
    try {
      execSync("better-auth migrate --yes --config ./dist/src/utils/auth.js", {
        stdio: "inherit",
      });
    } catch {
      console.warn(
        "better-auth migrations may have nothing to do, skipping...",
      );
    }
  } catch (err) {
    console.error("Error running migrations:", err);
    process.exit(1);
  }
}

function startServer() {
  console.log(`Starting API server on port ${env.PORT}...`);
  try {
    execSync(`node dist/src/index.js`, { stdio: "inherit" });
  } catch (err) {
    console.error("Server exited with an error:", err);
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
    console.warn(
      "Image orphan cleanup skipped:",
      err instanceof Error ? err.message : err,
    );
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
