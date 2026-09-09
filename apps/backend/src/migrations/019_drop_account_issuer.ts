import type { Kysely } from "kysely";
import { sql } from "kysely";
import { dialect, shortText } from "@utils/migration-helpers.js";

/**
 * Reverses migration 018.
 *
 * better-auth 1.7.0 through 1.7.2 scoped account identity by ("issuer",
 * "accountId") and required a NOT NULL "issuer" column. better-auth 1.7.3
 * reverted that: accounts are keyed on ("providerId", "accountId") again and
 * the core account schema is back to its 1.6 shape, unchanged. See
 * https://www.better-auth.com/docs/guides/1-7-upgrade-guide
 *
 * 1.7.3 never writes "issuer", so the NOT NULL column migration 018 left
 * behind rejects *every* insert into "account" — every sign-up and every
 * account link — with better-auth's own "Required columns Better Auth never
 * writes" schema-mismatch error. This migration relaxes that, which must
 * land in the same release that upgrades better-auth to >= 1.7.3.
 *
 * 018 is deliberately left in place rather than rewritten: it has already
 * run against production databases and Kysely records it as applied, so it
 * can't be un-run. On a fresh install the pair is a no-op overall — 018 adds
 * the column, 019 removes it again.
 *
 * The unique index goes first. Dropping it before the column matters on
 * MySQL, where a column can't be dropped while an index still references it,
 * and where DROP INDEX needs the "ON <table>" form rather than the generic
 * "IF EXISTS" one Kysely's dropIndex() builder emits.
 */

const INDEX_NAME = "account_issuer_accountId_uidx";
const CREDENTIAL_ISSUER = "local:credential";

async function tableExists(db: Kysely<any>, name: string): Promise<boolean> {
  const tables = await db.introspection.getTables();
  return tables.some((t) => t.name === name);
}

async function getColumn(db: Kysely<any>, table: string, column: string) {
  const tables = await db.introspection.getTables();
  return tables
    .find((t) => t.name === table)
    ?.columns.find((c) => c.name === column);
}

async function mysqlIndexExists(db: Kysely<any>): Promise<boolean> {
  const existing = await sql<{ count: number }>`
    SELECT COUNT(*) as count FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'account' AND index_name = ${INDEX_NAME}
  `.execute(db);
  return Number(existing.rows[0]?.count ?? 0) > 0;
}

async function dropUniqueIndex(db: Kysely<any>): Promise<void> {
  if (dialect === "mysql") {
    if (!(await mysqlIndexExists(db))) return;
    await sql`ALTER TABLE \`account\` DROP INDEX \`${sql.raw(INDEX_NAME)}\``.execute(
      db,
    );
    return;
  }
  await sql`DROP INDEX IF EXISTS "${sql.raw(INDEX_NAME)}"`.execute(db);
}

export async function up(db: Kysely<any>): Promise<void> {
  if (!(await tableExists(db, "account"))) return;
  if (!(await getColumn(db, "account", "issuer"))) return;

  await dropUniqueIndex(db);

  // SQLite has supported ALTER TABLE ... DROP COLUMN since 3.35 (better-sqlite3
  // 13 bundles 3.53), so all three dialects take the same path. Dropping the
  // column rather than rebuilding the table also keeps this migration correct
  // if a later better-auth version adds columns of its own — a hand-written
  // CREATE TABLE would silently discard them.
  if (dialect === "mysql") {
    await sql`ALTER TABLE \`account\` DROP COLUMN \`issuer\``.execute(db);
    return;
  }
  await db.schema.alterTable("account").dropColumn("issuer").execute();
}

/**
 * Restores the column and its index for a rollback to a better-auth 1.7.0 -
 * 1.7.2 deployment, but leaves "issuer" nullable rather than reinstating the
 * NOT NULL constraint 018 applied. Nullable satisfies both versions — 1.7.2
 * populates the column on every insert, and 1.7.3 ignores it — whereas NOT
 * NULL would recreate the exact state that breaks 1.7.3, so a down/up cycle
 * on a 1.7.3 deployment would leave sign-up broken.
 */
export async function down(db: Kysely<any>): Promise<void> {
  if (!(await tableExists(db, "account"))) return;
  if (await getColumn(db, "account", "issuer")) return;

  await db.schema
    .alterTable("account")
    .addColumn("issuer", shortText())
    .execute();

  await db
    .updateTable("account")
    .set({ issuer: CREDENTIAL_ISSUER })
    .where("providerId", "=", "credential")
    .execute();

  if (dialect === "mysql") {
    await sql`CREATE UNIQUE INDEX \`${sql.raw(INDEX_NAME)}\` ON \`account\` (\`issuer\`, \`accountId\`)`.execute(
      db,
    );
    return;
  }
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "${sql.raw(INDEX_NAME)}" ON "account" ("issuer", "accountId")`.execute(
    db,
  );
}
