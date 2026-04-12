import type { Kysely } from "kysely";
import { sql } from "kysely";
import { dialect } from "@utils/migration-helpers.js";

/**
 * Align column types for existing SQLite databases.
 *
 * Migration 010 was rewritten to use decimal() for purchasePrice (numeric(12,2))
 * instead of "real". Existing SQLite databases already ran the old version which
 * created the column as REAL. On SQLite, both REAL and NUMERIC have NUMERIC
 * type affinity, so the data is compatible — but we recreate the table to make
 * the schema metadata consistent with fresh installs.
 *
 * On PostgreSQL and MySQL this migration is a no-op (fresh installs already
 * have the correct type from the rewritten migration 010).
 */
export async function up(db: Kysely<any>): Promise<void> {
  if (dialect !== "sqlite") return;

  // SQLite doesn't support ALTER COLUMN, so we rebuild the table
  await sql`
    CREATE TABLE "bottle_new" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "purchaseDate" TEXT NOT NULL,
      "purchasePrice" NUMERIC(12, 2) NOT NULL,
      "vintageId" INTEGER NOT NULL REFERENCES "vintage"("id"),
      "storageId" INTEGER REFERENCES "storage"("id"),
      "status" TEXT NOT NULL,
      "size" TEXT NOT NULL DEFAULT 'standard'
    )
  `.execute(db);

  await sql`
    INSERT INTO "bottle_new" ("id", "purchaseDate", "purchasePrice", "vintageId", "storageId", "status", "size")
    SELECT "id", "purchaseDate", "purchasePrice", "vintageId", "storageId", "status", "size"
    FROM "bottle"
  `.execute(db);

  // Recreate indexes before swapping (they'll be dropped with the old table)
  await sql`DROP INDEX IF EXISTS "idx_bottle_vintageId"`.execute(db);
  await sql`DROP INDEX IF EXISTS "idx_bottle_storageId"`.execute(db);

  await sql`DROP TABLE "bottle"`.execute(db);
  await sql`ALTER TABLE "bottle_new" RENAME TO "bottle"`.execute(db);

  await sql`CREATE INDEX "idx_bottle_vintageId" ON "bottle" ("vintageId")`.execute(
    db,
  );
  await sql`CREATE INDEX "idx_bottle_storageId" ON "bottle" ("storageId")`.execute(
    db,
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  // No-op: reverting would change numeric(12,2) back to real,
  // but the data is compatible either way on SQLite.
}
