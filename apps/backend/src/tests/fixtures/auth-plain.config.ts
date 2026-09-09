// Better Auth config for auth-schema-compatibility.test.ts, used by both the
// "auth migrate" CLI subprocess and the in-process sign-up/sign-in calls.
//
// Unlike auth-integration.config.ts this uses Better Auth's default, unprefixed
// model names, because that test runs the app's own Kysely migrations against
// the result and those address "account" and "user" by name. Safe only against
// a throwaway database — hence SQLite-only; see the test.
//
// Kept self-contained (no app src/ imports) since the CLI's config loader
// can't resolve this project's path aliases.
import { betterAuth } from "better-auth";
import { admin, bearer } from "better-auth/plugins";
import { SqliteDialect } from "kysely";
import type { Dialect } from "kysely";
import Database from "better-sqlite3";

// Memoized so the test's own queries and better-auth's internal adapter share
// one connection, letting a single destroy() close both.
let cachedDialect: Dialect | undefined;

export function buildDialect(): Dialect {
  if (cachedDialect) return cachedDialect;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL must be set to load this config");

  cachedDialect = new SqliteDialect({ database: new Database(url) });
  return cachedDialect;
}

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: "http://localhost:3000",
  secret: "auth-schema-compat-test-secret-do-not-use-in-production-00000",
  database: { dialect: buildDialect(), type: "sqlite" },
  emailAndPassword: { enabled: true },
  plugins: [admin({ defaultRole: "user" }), bearer()],
});
