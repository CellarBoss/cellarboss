import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { Kysely, sql } from "kysely";
import type { Dialect } from "kysely";
import type { auth as AuthType } from "./fixtures/auth-integration.config.js";

// Runs the real "auth migrate" CLI, then a real sign-up + sign-in, against
// an isolated database so it doesn't collide with the rest of the suite.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authConfigPath = path.resolve(
  __dirname,
  "./fixtures/auth-integration.config.ts",
);

const originalDatabaseUrl = process.env.DATABASE_URL;
const databaseType = process.env.DATABASE_TYPE ?? "sqlite";

let isolatedUrl: string;
let sqliteFilePath: string | undefined;
let auth: typeof AuthType;
let MODEL_PREFIX: string;
let buildDialect: () => Dialect;

describe("real better-auth migration + sign-up/sign-in", () => {
  beforeAll(async () => {
    if (databaseType === "sqlite") {
      sqliteFilePath = path.join(
        os.tmpdir(),
        `cb-auth-integration-${Date.now()}-${process.pid}.sqlite`,
      );
      isolatedUrl = sqliteFilePath;
    } else {
      // Isolation comes from prefixed table names instead.
      isolatedUrl = originalDatabaseUrl!;
    }

    process.env.DATABASE_URL = isolatedUrl;

    execSync(`auth migrate --yes --config "${authConfigPath}"`, {
      stdio: "inherit",
      env: process.env,
    });

    const fixture = await import("./fixtures/auth-integration.config.js");
    auth = fixture.auth;
    MODEL_PREFIX = fixture.MODEL_PREFIX;
    buildDialect = fixture.buildDialect;
  }, 30_000);

  afterAll(async () => {
    if (databaseType === "sqlite") {
      // Best-effort: the file may still be open, which errors on Windows.
      try {
        if (sqliteFilePath) fs.rmSync(sqliteFilePath, { force: true });
      } catch {
        // ignore
      }
    } else {
      const db = new Kysely<any>({ dialect: buildDialect() });
      for (const table of ["session", "account", "verification", "user"]) {
        await sql`drop table if exists ${sql.raw(`${MODEL_PREFIX}_${table}`)}`.execute(
          db,
        );
      }
      await db.destroy();
    }

    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("signs a new user up and back in through the real adapter", async () => {
    const email = "auth-integration-test@cellarboss.org";
    const password = "auth-integration-test-password";

    const signUp = await auth.api.signUpEmail({
      body: { email, password, name: "Auth Integration Test" },
    });
    expect(signUp.user?.email).toBe(email);

    const signIn = await auth.api.signInEmail({
      body: { email, password },
      asResponse: false,
    });
    expect(signIn.user?.email).toBe(email);
    expect(signIn.token).toBeTruthy();
  });

  it("stores the issuer better-auth 1.7+ requires for credential accounts", async () => {
    const db = new Kysely<any>({ dialect: buildDialect() });
    try {
      const account = (await db
        .selectFrom(`${MODEL_PREFIX}_account`)
        .select(["issuer", "providerId"])
        .where("providerId", "=", "credential")
        .executeTakeFirstOrThrow()) as { issuer: string; providerId: string };

      expect(account.issuer).toBe("local:credential");
    } finally {
      await db.destroy();
    }
  });
});
