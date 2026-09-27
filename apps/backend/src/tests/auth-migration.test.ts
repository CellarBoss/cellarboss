import type { UntypedKysely, UntypedDatabase } from "@schema/untyped.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { Kysely, sql } from "kysely";
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
let testDb: UntypedKysely | undefined;

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
    // Same (memoized) dialect better-auth's own adapter uses, so destroying
    // this one connection in afterAll closes both.
    testDb = new Kysely<UntypedDatabase>({ dialect: fixture.buildDialect() });
  }, 30_000);

  afterAll(async () => {
    if (testDb) {
      if (databaseType !== "sqlite") {
        for (const table of ["session", "account", "verification", "user"]) {
          await sql`drop table if exists ${sql.raw(`${MODEL_PREFIX}_${table}`)}`.execute(
            testDb,
          );
        }
      }
      await testDb.destroy();
    }

    if (databaseType === "sqlite" && sqliteFilePath) {
      try {
        fs.rmSync(sqliteFilePath, { force: true });
      } catch {
        // best-effort
      }
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

  // The web app relies on these endpoints to change passwords. update-user
  // silently drops a password, which is how the profile page came to report
  // success without changing anything (#1066).
  describe("password changes", () => {
    async function signUpAndIn(email: string, password: string) {
      await auth.api.signUpEmail({
        body: { email, password, name: email },
      });
      const signIn = await auth.api.signInEmail({
        body: { email, password },
        asResponse: false,
      });
      return new Headers({ authorization: `Bearer ${signIn.token}` });
    }

    async function canSignIn(email: string, password: string) {
      try {
        await auth.api.signInEmail({ body: { email, password } });
        return true;
      } catch {
        return false;
      }
    }

    it("update-user ignores a password", async () => {
      const email = "auth-update-user-password@cellarboss.org";
      const headers = await signUpAndIn(email, "Original-password-1");

      await auth.api.updateUser({
        headers,
        body: { name: "Renamed", password: "Ignored-password-1" } as {
          name: string;
        },
      });

      expect(await canSignIn(email, "Original-password-1")).toBe(true);
      expect(await canSignIn(email, "Ignored-password-1")).toBe(false);
    });

    it("change-password replaces the user's own password", async () => {
      const email = "auth-change-password@cellarboss.org";
      const headers = await signUpAndIn(email, "Original-password-1");

      await auth.api.changePassword({
        headers,
        body: {
          currentPassword: "Original-password-1",
          newPassword: "Changed-password-1",
          revokeOtherSessions: true,
        },
      });

      expect(await canSignIn(email, "Changed-password-1")).toBe(true);
      expect(await canSignIn(email, "Original-password-1")).toBe(false);
    });

    it("change-password rejects a wrong current password", async () => {
      const email = "auth-change-password-wrong@cellarboss.org";
      const headers = await signUpAndIn(email, "Original-password-1");

      await expect(
        auth.api.changePassword({
          headers,
          body: {
            currentPassword: "Not-the-password-1",
            newPassword: "Changed-password-1",
          },
        }),
      ).rejects.toMatchObject({ body: { code: "INVALID_PASSWORD" } });

      expect(await canSignIn(email, "Original-password-1")).toBe(true);
    });

    it("admin set-user-password replaces another user's password", async () => {
      const adminEmail = "auth-admin-set-password@cellarboss.org";
      const adminHeaders = await signUpAndIn(adminEmail, "Admin-password-1");
      await testDb!
        .updateTable(`${MODEL_PREFIX}_user`)
        .set({ role: "admin" })
        .where("email", "=", adminEmail)
        .execute();

      const email = "auth-admin-set-password-target@cellarboss.org";
      const signUp = await auth.api.signUpEmail({
        body: { email, password: "Original-password-1", name: email },
      });

      await auth.api.setUserPassword({
        headers: adminHeaders,
        body: { userId: signUp.user.id, newPassword: "Reset-password-1" },
      });

      expect(await canSignIn(email, "Reset-password-1")).toBe(true);
      expect(await canSignIn(email, "Original-password-1")).toBe(false);
    });
  });
});
