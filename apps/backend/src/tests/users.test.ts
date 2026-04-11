import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { Kysely } from "kysely";
import {
  createTestApp,
  createTestAppWithAuth,
  createTestAppWithNonAdmin,
  createTestUser,
  runMigrations,
} from "./setup";
import { registerUserRoutes } from "@routes/users.routes.js";
import { db } from "@utils/database.js";

const userDb = db as Kysely<any>;

describe("User API", () => {
  let testUserId: string;

  beforeAll(async () => {
    await runMigrations(db);
    await createTestUser(
      db,
      "user-for-test",
      "Test User",
      "usertest@example.com",
    );

    // Override role to 'user' (createTestUser defaults to 'admin')
    await userDb
      .updateTable("user")
      .set({ role: "user" })
      .where("id", "=", "user-for-test")
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
