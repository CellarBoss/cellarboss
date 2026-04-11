import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestAppWithAuth,
  createTestAppWithNonAdmin,
  runMigrations,
  cleanDatabase,
} from "./setup";
import { registerSettingsRoutes } from "@routes/settings.routes.js";
import { db } from "@utils/database.js";

describe("Admin middleware", () => {
  beforeAll(async () => {
    await runMigrations(db);
    await cleanDatabase(db);

    // Seed a test setting
    await db
      .insertInto("setting")
      .values({ key: "admin-test", value: "original" })
      .onConflict((oc) => oc.column("key").doUpdateSet({ value: "original" }))
      .execute();
  });

  describe("non-admin user", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestAppWithNonAdmin();
      registerSettingsRoutes(app);
    });

    it("returns 403 for admin-only route", async () => {
      const res = await app.request("/settings/admin-test", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "hacked" }),
      });
      expect(res.status).toBe(403);
    });

    it("allows public GET routes", async () => {
      const res = await app.request("/settings");
      expect(res.status).toBe(200);
    });
  });

  describe("admin user", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestAppWithAuth();
      registerSettingsRoutes(app);
    });

    it("allows admin to access admin-only route", async () => {
      const res = await app.request("/settings/admin-test", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "updated" }),
      });
      expect(res.status).toBe(200);
    });
  });
});
