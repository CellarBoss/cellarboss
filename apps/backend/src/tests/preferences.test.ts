import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestAppWithAuth,
  createTestApp,
  runMigrations,
  cleanDatabase,
  createTestUser,
} from "./setup";
import { registerPreferenceRoutes } from "@routes/preferences.routes.js";
import { db } from "@utils/database.js";

const USER_ID = "test-user-1";

describe("Preferences API", () => {
  beforeAll(async () => {
    await runMigrations(db);
  });

  beforeEach(async () => {
    await cleanDatabase(db);
    await createTestUser(db, USER_ID);
  });

  describe("unauthenticated access", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerPreferenceRoutes(app);
    });

    it("GET /user/preferences returns 401", async () => {
      const res = await app.request("/user/preferences");
      expect(res.status).toBe(401);
    });

    it("GET /user/preferences/:key returns 401", async () => {
      const res = await app.request("/user/preferences/columns.bottles");
      expect(res.status).toBe(401);
    });

    it("PUT /user/preferences/:key returns 401", async () => {
      const res = await app.request("/user/preferences/columns.bottles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "{}" }),
      });
      expect(res.status).toBe(401);
    });

    it("DELETE /user/preferences/:key returns 401", async () => {
      const res = await app.request("/user/preferences/columns.bottles", {
        method: "DELETE",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("authenticated operations", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestAppWithAuth(USER_ID);
      registerPreferenceRoutes(app);
    });

    it("GET /user/preferences returns empty list initially", async () => {
      const res = await app.request("/user/preferences");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it("PUT /user/preferences/:key creates a preference", async () => {
      const value = JSON.stringify({ name: true, vintage: false });
      const res = await app.request("/user/preferences/columns.bottles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.key).toBe("columns.bottles");
      expect(data.value).toBe(value);
      expect(data.userId).toBe(USER_ID);
    });

    it("PUT /user/preferences/:key updates an existing preference", async () => {
      const initial = JSON.stringify({ name: true });
      const updated = JSON.stringify({ name: false });

      await app.request("/user/preferences/columns.bottles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: initial }),
      });

      const res = await app.request("/user/preferences/columns.bottles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: updated }),
      });
      expect(res.status).toBe(200);
      expect((await res.json()).value).toBe(updated);
    });

    it("GET /user/preferences returns all preferences", async () => {
      await app.request("/user/preferences/columns.bottles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "{}" }),
      });
      await app.request("/user/preferences/columns.vintages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "{}" }),
      });

      const res = await app.request("/user/preferences");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveLength(2);
      expect(data.map((p: { key: string }) => p.key)).toEqual(
        expect.arrayContaining(["columns.bottles", "columns.vintages"]),
      );
    });

    it("GET /user/preferences/:key returns a specific preference", async () => {
      const value = JSON.stringify({ name: true });
      await app.request("/user/preferences/columns.bottles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      const res = await app.request("/user/preferences/columns.bottles");
      expect(res.status).toBe(200);
      expect((await res.json()).value).toBe(value);
    });

    it("GET /user/preferences/:key returns 404 for missing preference", async () => {
      const res = await app.request("/user/preferences/columns.bottles");
      expect(res.status).toBe(404);
    });

    it("DELETE /user/preferences/:key removes the preference", async () => {
      await app.request("/user/preferences/columns.bottles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "{}" }),
      });

      const del = await app.request("/user/preferences/columns.bottles", {
        method: "DELETE",
      });
      expect(del.status).toBe(200);

      const get = await app.request("/user/preferences/columns.bottles");
      expect(get.status).toBe(404);
    });

    it("PUT /user/preferences/:key rejects an invalid key format", async () => {
      const res = await app.request("/user/preferences/Invalid-Key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "{}" }),
      });
      expect(res.status).toBe(400);
    });

    it("PUT /user/preferences/:key rejects a missing value", async () => {
      const res = await app.request("/user/preferences/columns.bottles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it("users cannot see each other's preferences", async () => {
      await app.request("/user/preferences/columns.bottles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "{}" }),
      });

      const otherUserId = "test-user-2";
      await createTestUser(db, otherUserId, "Other User", "other@example.com");
      const otherApp = createTestAppWithAuth(otherUserId, "other@example.com");
      registerPreferenceRoutes(otherApp);

      const res = await otherApp.request("/user/preferences");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });
  });
});
