import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { createTestApp, createTestAppWithAuth, runMigrations } from "./setup";
import { registerSettingsRoutes } from "@routes/settings.routes.js";
import { db } from "@utils/database.js";

describe("Settings API", () => {
  beforeAll(async () => {
    await runMigrations(db);
  });

  describe("public access (no auth)", () => {
    let app: OpenAPIHono;

    beforeEach(async () => {
      app = createTestApp();
      registerSettingsRoutes(app);

      // Seed a test setting
      await db
        .insertInto("setting")
        .values({ key: "theme", value: "dark" })
        .onConflict((oc) => oc.column("key").doUpdateSet({ value: "dark" }))
        .execute();
    });

    it("GET /settings returns 200 with settings list", async () => {
      const res = await app.request("/settings");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it("GET /settings/:key returns a specific setting", async () => {
      const res = await app.request("/settings/theme");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.key).toBe("theme");
      expect(data.value).toBe("dark");
    });

    it("GET /settings/:key returns 404 for non-existent setting", async () => {
      const res = await app.request("/settings/nonexistent");
      expect(res.status).toBe(404);
    });

    it("PUT /settings/:key returns 401 without auth", async () => {
      const res = await app.request("/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "light" }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations (admin)", () => {
    let app: OpenAPIHono;

    beforeEach(async () => {
      app = createTestAppWithAuth();
      registerSettingsRoutes(app);

      // Seed a test setting
      await db
        .insertInto("setting")
        .values({ key: "currency", value: "USD" })
        .onConflict((oc) => oc.column("key").doUpdateSet({ value: "USD" }))
        .execute();
    });

    it("PUT /settings/:key updates a setting", async () => {
      const res = await app.request("/settings/currency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "EUR" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.value).toBe("EUR");
    });

    it("PUT /settings/:key returns 400 with invalid data", async () => {
      const res = await app.request("/settings/currency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });
  });
});
