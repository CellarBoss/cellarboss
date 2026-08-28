// Better Auth config for auth-migration.test.ts, used by both the "auth
// migrate" CLI subprocess and the in-process sign-up/sign-in calls. Kept
// self-contained (no app src/ imports) since the CLI's config loader can't
// resolve this project's path aliases. Prefixed model names let it share
// the existing test database without colliding with other fixtures.
import { betterAuth } from "better-auth";
import { admin, bearer } from "better-auth/plugins";
import { SqliteDialect, PostgresDialect, MysqlDialect } from "kysely";
import type { Dialect } from "kysely";
import Database from "better-sqlite3";
import pg from "pg";
import { createPool as createMysqlPool } from "mysql2";

export const MODEL_PREFIX = "authIntegrationTest";

// Memoized so this test's own queries and better-auth's internal adapter
// share the same underlying connection, letting a single destroy() (see
// auth-migration.test.ts) close it rather than leaking one per call.
let cachedDialect: Dialect | undefined;

export function buildDialect(): Dialect {
  if (cachedDialect) return cachedDialect;

  const type = process.env.DATABASE_TYPE;
  const url = process.env.DATABASE_URL;
  if (!type || !url) {
    throw new Error(
      "DATABASE_TYPE and DATABASE_URL must be set to load this config",
    );
  }

  if (type === "sqlite") {
    cachedDialect = new SqliteDialect({ database: new Database(url) });
  } else if (type === "postgres") {
    cachedDialect = new PostgresDialect({
      pool: new pg.Pool({ connectionString: url }),
    });
  } else if (type === "mysql") {
    const parsed = new URL(url);
    cachedDialect = new MysqlDialect({
      pool: createMysqlPool({
        host: parsed.hostname,
        port: parseInt(parsed.port) || 3306,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.slice(1),
      }),
    });
  } else {
    throw new Error(`Unsupported DATABASE_TYPE: ${type}`);
  }

  return cachedDialect;
}

export const auth = betterAuth({
  basePath: "/api/auth",
  secret: "auth-integration-test-secret-do-not-use-in-production-000000",
  database: {
    dialect: buildDialect(),
    type: process.env.DATABASE_TYPE as "sqlite" | "postgres" | "mysql",
  },
  emailAndPassword: {
    enabled: true,
  },
  user: { modelName: `${MODEL_PREFIX}_user` },
  session: { modelName: `${MODEL_PREFIX}_session` },
  account: { modelName: `${MODEL_PREFIX}_account` },
  verification: { modelName: `${MODEL_PREFIX}_verification` },
  plugins: [
    admin({
      defaultRole: "user",
    }),
    bearer(),
  ],
});
