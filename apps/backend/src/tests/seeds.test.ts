import { describe, it, expect, beforeAll, afterAll } from "vitest";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { Kysely, SqliteDialect, sql } from "kysely";
import Database from "better-sqlite3";
import type { Database as DatabaseSchema } from "@schema/database.js";
import { runSeeds } from "@utils/seed.js";
import { runMigrations } from "./setup.js";

// Expectations are derived from the seeds folder, so a new seed file is picked
// up automatically. SQLite-only: needs a database isolated from the shared one.
const databaseType = process.env.DATABASE_TYPE ?? "sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const realSeedFolder = path.resolve(__dirname, "../seeds");

let db: Kysely<DatabaseSchema>;
let sqliteFile: string;
let folder: string;

function countRows(table: string) {
  return sql<{
    count: number | bigint;
  }>`select count(*) as count from ${sql.table(table)}`
    .execute(db)
    .then((r) => Number(r.rows[0]?.count ?? 0));
}

/** Row counts for every table except the ledger's own. */
async function snapshot(): Promise<Record<string, number>> {
  const tables = await db.introspection.getTables();
  const counts: Record<string, number> = {};
  for (const table of tables) {
    if (/^(seed_history|kysely_migration)/.test(table.name)) continue;
    counts[table.name] = await countRows(table.name);
  }
  return counts;
}

async function ledger(): Promise<string[]> {
  const rows = await (db as Kysely<any>)
    .selectFrom("seed_history")
    .select("name")
    .orderBy("name")
    .execute();
  return rows.map((r: { name: string }) => r.name);
}

const expectedSeeds = () =>
  fs
    .readdirSync(folder)
    .map((f) => f.replace(/\.(ts|js)$/, ""))
    .sort();

describe.runIf(databaseType === "sqlite")("seeds", () => {
  beforeAll(async () => {
    sqliteFile = path.join(
      os.tmpdir(),
      `cb-seeds-${Date.now()}-${process.pid}.sqlite`,
    );
    db = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({ database: new Database(sqliteFile) }),
    });
    await runMigrations(db);

    // Seed 000 goes through better-auth, which binds to the shared app
    // database rather than this throwaway one, so the fixture omits it.
    folder = fs.mkdtempSync(path.join(os.tmpdir(), "cb-seeds-"));
    for (const name of fs.readdirSync(realSeedFolder)) {
      if (name.startsWith("000_")) continue;
      fs.copyFileSync(path.join(realSeedFolder, name), path.join(folder, name));
    }
  }, 30_000);

  afterAll(async () => {
    await db?.destroy();
    for (const target of [sqliteFile, folder]) {
      try {
        fs.rmSync(target, { force: true, recursive: true });
      } catch {
        // best-effort
      }
    }
  });

  it("populates the database and records each seed", async () => {
    await runSeeds(db, folder);

    expect(await ledger()).toEqual(expectedSeeds());
    expect(await countRows("country")).toBeGreaterThan(0);
  }, 30_000);

  it("is idempotent when replayed against an already-populated database", async () => {
    // The upgrade path: an existing install has data but an empty ledger, so
    // every seed runs once more over rows that are already there. A seed that
    // is not idempotent crash-loops the backend on upgrade.
    const before = await snapshot();

    await sql`delete from seed_history`.execute(db);
    await runSeeds(db, folder);

    expect(await snapshot()).toEqual(before);
  }, 30_000);
});
