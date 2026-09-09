import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { Kysely } from "kysely";
import type { auth as AuthType } from "./fixtures/auth-plain.config.js";
import { runMigrations } from "./setup.js";

/**
 * Smoke test for the auth schema: build it the way startup.ts does — Better
 * Auth's own migration first, then every Kysely migration on top — and check
 * that Better Auth can still authenticate against the result.
 *
 * Deliberately behavioural. Anything that puts our migrations and Better
 * Auth's expectations out of step — a column it starts requiring, a column we
 * leave behind that it never writes — surfaces here as a failed sign-up,
 * whatever the specifics turn out to be.
 *
 * SQLite-only: it needs Better Auth's default table names (our migrations
 * address "account" and "user" by name) against a throwaway database, and
 * SQLite is the only dialect that can be isolated from the shared test
 * database that way.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authConfigPath = path.resolve(
  __dirname,
  "./fixtures/auth-plain.config.ts",
);

const originalDatabaseUrl = process.env.DATABASE_URL;
const databaseType = process.env.DATABASE_TYPE ?? "sqlite";

let auth: typeof AuthType;
let sqliteFilePath: string;
let testDb: Kysely<any> | undefined;

describe.runIf(databaseType === "sqlite")("auth schema", () => {
  beforeAll(async () => {
    sqliteFilePath = path.join(
      os.tmpdir(),
      `cb-auth-schema-${Date.now()}-${process.pid}.sqlite`,
    );
    process.env.DATABASE_URL = sqliteFilePath;

    execSync(`auth migrate --yes --config "${authConfigPath}"`, {
      stdio: "inherit",
      env: process.env,
    });

    const fixture = await import("./fixtures/auth-plain.config.js");
    testDb = new Kysely<any>({ dialect: fixture.buildDialect() });
    await runMigrations(testDb);

    auth = fixture.auth;
  }, 30_000);

  afterAll(async () => {
    await testDb?.destroy();
    try {
      fs.rmSync(sqliteFilePath, { force: true });
    } catch {
      // best-effort
    }
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("lets a new user sign up and sign in", async () => {
    const email = "auth-schema-test@cellarboss.org";
    const password = "auth-schema-test-password";

    const signUp = await auth.api.signUpEmail({
      body: { email, password, name: "Auth Schema Test" },
    });
    expect(signUp.user?.email).toBe(email);

    const signIn = await auth.api.signInEmail({
      body: { email, password },
      asResponse: false,
    });
    expect(signIn.user?.email).toBe(email);
    expect(signIn.token).toBeTruthy();
  });

  it("keeps existing credentials working across a migration run", async () => {
    const email = "auth-schema-existing@cellarboss.org";
    const password = "auth-schema-existing-password";

    await auth.api.signUpEmail({
      body: { email, password, name: "Auth Schema Existing" },
    });

    await runMigrations(testDb!);

    const signIn = await auth.api.signInEmail({
      body: { email, password },
      asResponse: false,
    });
    expect(signIn.user?.email).toBe(email);
    expect(signIn.token).toBeTruthy();
  });
});
