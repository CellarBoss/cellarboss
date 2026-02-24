#!/usr/bin/env ts-node

import type { Database } from "@schema/database.js";
import { db } from "./database.js";
import { execSync } from "child_process";
import process from "process";
import { sql, type Kysely } from "kysely";

const RETRY_INTERVAL = Number(process.env.DB_RETRY_INTERVAL) || 2000;
const MAX_RETRIES = Number(process.env.DB_MAX_RETRIES) || 30;
const PORT = process.env.PORT || "4000";

async function waitForDb() {
  let retries = 0;

  while (true) {
    try {
      await sql`SELECT 1`.execute(db);
      console.log("Database is available");
      return db;
    } catch (err) {
      retries += 1;
      if (retries > MAX_RETRIES) {
        console.error("Database not available after max retries:", err);
        process.exit(1);
      }
      console.log(`Waiting for database... retry ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
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
      execSync("pnpm seed", { stdio: "inherit" });
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
    execSync("pnpm migrate", { stdio: "inherit" });

    console.log("Running better-auth migrations...");
    try {
      execSync("pnpm auth:migrate", { stdio: "inherit" });
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
  console.log(`Starting API server on port ${PORT}...`);
  try {
    execSync(`node dist/src/index.js`, { stdio: "inherit" });
  } catch (err) {
    console.error("Server exited with an error:", err);
    process.exit(1);
  }
}

async function main() {
  const db = await waitForDb();
  await runMigrations();
  await checkAndSeed(db);
  startServer();
}

main();
