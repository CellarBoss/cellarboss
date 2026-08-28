import type { Kysely } from "kysely";
import { sql } from "kysely";
import { dialect, shortText } from "@utils/migration-helpers.js";

/**
 * better-auth 1.7 scopes accounts by ("issuer", "accountId") instead of just
 * "providerId"/"accountId". Its own CLI migration adds "issuer" as NOT NULL
 * with no default, which is unsafe on a populated table:
 *
 * - Newer CLI versions (>=1.7-aware) refuse to run it at all.
 * - Older CLI versions (as used here before this fix) let MySQL run it, and
 *   MySQL silently accepts an "ADD COLUMN ... NOT NULL" on existing rows by
 *   backfilling an empty string instead of rejecting the statement. That
 *   corrupts every existing account row's issuer, breaking login with
 *   "User not found" — see https://better-auth.com/docs/guides/1-7-upgrade-guide#account-identity-is-scoped-by-issuer
 *
 * This migration performs the backfill ourselves so it's safe to run
 * unattended against production, regardless of which of the three states an
 * existing database is in:
 *   1. "account" doesn't exist yet (fresh install) — nothing to do, since
 *      better-auth's own migrate (which runs after this, see startup.ts)
 *      creates the table with "issuer" already correct on an empty table.
 *   2. "issuer" column doesn't exist yet (e.g. sqlite, where the CLI refused
 *      to touch a populated table) — add it, backfill, enforce NOT NULL.
 *   3. "issuer" column exists but every row is corrupted to '' (the MySQL
 *      silent-corruption case above) — re-backfill in place.
 *
 * This app only ever creates "credential" (email/password) accounts — see
 * apps/backend/src/utils/auth.ts, which has no social/OAuth providers
 * configured — so every row maps to the same issuer. The assertion below
 * isn't guarding this database against rows created after this migration
 * runs (Kysely never re-runs a completed migration, so that can't happen
 * here) — it's guarding databases where this migration runs *late*, after a
 * social provider has already shipped and started writing non-"credential"
 * rows: a stale staging snapshot, a self-hosted install that's behind on
 * upgrades, or any environment where code and migrations aren't applied in
 * lockstep. In the "issuer" already NOT NULL branch (case 3 above) that's
 * silent: backfillIssuer only touches providerId="credential" rows, so an
 * unmapped provider would otherwise be skipped with no error and stay
 * corrupted indefinitely. Extend the issuer mapping here before adding a
 * social provider.
 */

const CREDENTIAL_ISSUER = "local:credential";
const INDEX_NAME = "account_issuer_accountId_uidx";

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

async function assertOnlyKnownProviders(db: Kysely<any>): Promise<void> {
  const rows = await db
    .selectFrom("account")
    .select("providerId")
    .distinct()
    .execute();

  const unknown = rows
    .map((r: { providerId: string }) => r.providerId)
    .filter((id: string) => id !== "credential");

  if (unknown.length > 0) {
    throw new Error(
      `Migration 018 only knows how to backfill "issuer" for the "credential" ` +
        `provider, but found account row(s) with providerId: ${unknown.join(", ")}. ` +
        `Extend this migration with the correct issuer mapping for those ` +
        `providers before it can run against this database.`,
    );
  }
}

async function backfillIssuer(db: Kysely<any>): Promise<void> {
  await db
    .updateTable("account")
    .set({ issuer: CREDENTIAL_ISSUER })
    .where("providerId", "=", "credential")
    .where((eb: any) =>
      eb.or([eb("issuer", "is", null), eb("issuer", "!=", CREDENTIAL_ISSUER)]),
    )
    .execute();
}

async function enforceNotNull(db: Kysely<any>): Promise<void> {
  if (dialect === "postgres") {
    await sql`ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL`.execute(
      db,
    );
  } else if (dialect === "mysql") {
    await sql`ALTER TABLE \`account\` MODIFY COLUMN \`issuer\` VARCHAR(255) NOT NULL`.execute(
      db,
    );
  }
}

async function mysqlIndexExists(db: Kysely<any>): Promise<boolean> {
  const existing = await sql<{ count: number }>`
    SELECT COUNT(*) as count FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'account' AND index_name = ${INDEX_NAME}
  `.execute(db);
  return Number(existing.rows[0]?.count ?? 0) > 0;
}

async function ensureUniqueIndex(db: Kysely<any>): Promise<void> {
  if (dialect === "mysql") {
    if (await mysqlIndexExists(db)) return;
    await sql`CREATE UNIQUE INDEX \`${sql.raw(INDEX_NAME)}\` ON \`account\` (\`issuer\`, \`accountId\`)`.execute(
      db,
    );
  } else {
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "${sql.raw(INDEX_NAME)}" ON "account" ("issuer", "accountId")`.execute(
      db,
    );
  }
}

async function rebuildSqliteAccountTable(db: Kysely<any>): Promise<void> {
  // SQLite can't add a NOT NULL column with no default to a populated table,
  // and can't ALTER a column's nullability either way — rebuild the table.
  await sql`PRAGMA foreign_keys = OFF`.execute(db);

  await sql`
    CREATE TABLE "account_new" (
      "id" text not null primary key,
      "accountId" text not null,
      "providerId" text not null,
      "userId" text not null references "user" ("id") on delete cascade,
      "accessToken" text,
      "refreshToken" text,
      "idToken" text,
      "accessTokenExpiresAt" date,
      "refreshTokenExpiresAt" date,
      "scope" text,
      "password" text,
      "createdAt" date not null,
      "updatedAt" date not null,
      "issuer" text not null
    )
  `.execute(db);

  await sql`
    INSERT INTO "account_new"
      (id, accountId, providerId, userId, accessToken, refreshToken, idToken,
       accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt, issuer)
    SELECT
      id, accountId, providerId, userId, accessToken, refreshToken, idToken,
      accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt,
      ${CREDENTIAL_ISSUER}
    FROM "account"
  `.execute(db);

  await sql`DROP INDEX IF EXISTS "account_userId_idx"`.execute(db);
  await sql`DROP TABLE "account"`.execute(db);
  await sql`ALTER TABLE "account_new" RENAME TO "account"`.execute(db);

  await sql`CREATE INDEX "account_userId_idx" ON "account" ("userId")`.execute(
    db,
  );
  await sql`CREATE UNIQUE INDEX "${sql.raw(INDEX_NAME)}" ON "account" ("issuer", "accountId")`.execute(
    db,
  );

  const fkCheck = await sql`PRAGMA foreign_key_check("account")`.execute(db);
  if (fkCheck.rows.length > 0) {
    throw new Error(
      `Foreign key check failed after rebuilding "account": ${JSON.stringify(fkCheck.rows)}`,
    );
  }

  await sql`PRAGMA foreign_keys = ON`.execute(db);
}

export async function up(db: Kysely<any>): Promise<void> {
  if (!(await tableExists(db, "account"))) {
    return;
  }

  await assertOnlyKnownProviders(db);

  const issuerColumn = await getColumn(db, "account", "issuer");

  if (!issuerColumn) {
    if (dialect === "sqlite") {
      await rebuildSqliteAccountTable(db);
      return;
    }

    await db.schema
      .alterTable("account")
      .addColumn("issuer", shortText())
      .execute();
    await backfillIssuer(db);
    await enforceNotNull(db);
  } else if (issuerColumn.isNullable) {
    if (dialect === "sqlite") {
      // sqlite can't ALTER a column to NOT NULL in place — enforceNotNull()
      // is a no-op here, so a nullable "issuer" column (e.g. left behind by
      // an interrupted manual fix) must go through the rebuild path instead.
      await rebuildSqliteAccountTable(db);
      return;
    }
    await backfillIssuer(db);
    await enforceNotNull(db);
  } else {
    // Column already exists and is NOT NULL — the MySQL silent-corruption
    // case. No schema change needed, just repair the data.
    await backfillIssuer(db);
  }

  await ensureUniqueIndex(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  const issuerColumn = await getColumn(db, "account", "issuer");
  if (!issuerColumn) return;

  if (dialect === "sqlite") {
    await sql`PRAGMA foreign_keys = OFF`.execute(db);

    await sql`
      CREATE TABLE "account_new" (
        "id" text not null primary key,
        "accountId" text not null,
        "providerId" text not null,
        "userId" text not null references "user" ("id") on delete cascade,
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "accessTokenExpiresAt" date,
        "refreshTokenExpiresAt" date,
        "scope" text,
        "password" text,
        "createdAt" date not null,
        "updatedAt" date not null
      )
    `.execute(db);

    await sql`
      INSERT INTO "account_new"
        (id, accountId, providerId, userId, accessToken, refreshToken, idToken,
         accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt)
      SELECT
        id, accountId, providerId, userId, accessToken, refreshToken, idToken,
        accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt
      FROM "account"
    `.execute(db);

    await sql`DROP INDEX IF EXISTS "account_userId_idx"`.execute(db);
    await sql`DROP TABLE "account"`.execute(db);
    await sql`ALTER TABLE "account_new" RENAME TO "account"`.execute(db);
    await sql`CREATE INDEX "account_userId_idx" ON "account" ("userId")`.execute(
      db,
    );

    await sql`PRAGMA foreign_keys = ON`.execute(db);
    return;
  }

  if (dialect === "mysql") {
    // MySQL's DROP INDEX requires "ON <table>" and doesn't support the
    // "IF EXISTS" form the way Kysely's generic dropIndex() builder emits it.
    if (await mysqlIndexExists(db)) {
      await sql`ALTER TABLE \`account\` DROP INDEX \`${sql.raw(INDEX_NAME)}\``.execute(
        db,
      );
    }
    await sql`ALTER TABLE \`account\` DROP COLUMN \`issuer\``.execute(db);
    return;
  }

  await db.schema.dropIndex(INDEX_NAME).ifExists().execute();
  await db.schema.alterTable("account").dropColumn("issuer").execute();
}
