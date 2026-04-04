import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { sql, Kysely } from "kysely";
import {
  createTestApp,
  createTestAppWithAuth,
  createTestAppWithNonAdmin,
  runMigrations,
} from "./setup";
import { registerUserRoutes } from "@routes/users.routes.js";
import { db } from "@utils/database.js";

const userDb = db as Kysely<any>;

describe("User API", () => {
  let testUserId: string;

  beforeAll(async () => {
    await runMigrations(db);

    // Create the user table (normally managed by better-auth, not by Kysely migrations)
    await sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" INTEGER NOT NULL DEFAULT 0,
        "image" TEXT,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL,
        "role" TEXT DEFAULT 'user',
        "banned" INTEGER,
        "banReason" TEXT,
        "banExpires" TEXT
      )
    `.execute(userDb);

    // Seed a test user
    await userDb
      .insertInto("user")
      .values({
        id: "user-for-test",
        name: "Test User",
        email: "usertest@example.com",
        emailVerified: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: "user",
      })
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();

    testUserId = "user-for-test";
  });

  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerUserRoutes(app);
    });

    it("GET /user/:id returns 401", async () => {
      const res = await app.request("/user/some-id");
      expect(res.status).toBe(401);
    });

    it("PUT /user/:id returns 401", async () => {
      const res = await app.request("/user/some-id", { method: "PUT" });
      expect(res.status).toBe(401);
    });
  });

  describe("non-admin user", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestAppWithNonAdmin();
      registerUserRoutes(app);
    });

    it("GET /user/:id returns 403", async () => {
      const res = await app.request(`/user/${testUserId}`);
      expect(res.status).toBe(403);
    });

    it("PUT /user/:id returns 403", async () => {
      const res = await app.request(`/user/${testUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Hacked" }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe("admin operations", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestAppWithAuth();
      registerUserRoutes(app);
    });

    describe("GET /user/:id", () => {
      it("returns 404 for non-existent user", async () => {
        const res = await app.request("/user/non-existent-id");
        expect(res.status).toBe(404);
        const data = await res.json();
        expect(data.error).toBe("Not found");
      });

      it("returns user by id", async () => {
        const res = await app.request(`/user/${testUserId}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(testUserId);
        expect(data.name).toBe("Test User");
        expect(data.email).toBe("usertest@example.com");
      });
    });

    describe("PUT /user/:id", () => {
      it("updates a user name", async () => {
        const res = await app.request(`/user/${testUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Updated Name" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.name).toBe("Updated Name");
      });

      it("updates a user email", async () => {
        const res = await app.request(`/user/${testUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "newemail@example.com" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.email).toBe("newemail@example.com");
      });
    });
  });
});
