import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  cleanDatabase,
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
} from "./setup";
import { registerUserPreferenceRoutes } from "@routes/user-preferences.routes.js";
import { registerSettingsRoutes } from "@routes/settings.routes.js";
import { db } from "@utils/database.js";

describe("User Preferences API", () => {
  beforeAll(async () => {
    await runMigrations(db);
    await cleanDatabase(db);
  });

  describe("unauthenticated access", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerUserPreferenceRoutes(app);
    });

    it("GET /preferences/:key returns 401", async () => {
      const res = await app.request("/preferences/datatable.wines.columns");
      expect(res.status).toBe(401);
    });

    it("PUT /preferences/:key returns 401", async () => {
      const res = await app.request("/preferences/datatable.wines.columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: { name: true } }),
      });
      expect(res.status).toBe(401);
    });

    it("DELETE /preferences/:key returns 401", async () => {
      const res = await app.request("/preferences/datatable.wines.columns", {
        method: "DELETE",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("authenticated access", () => {
    let app: OpenAPIHono;

    beforeEach(async () => {
      await cleanDatabase(db);
      app = createTestAppWithAuth("user-a", "user-a@example.com");
      registerUserPreferenceRoutes(app);
    });

    it("returns 404 when a preference has not been saved", async () => {
      const res = await app.request("/preferences/datatable.wines.columns");
      expect(res.status).toBe(404);
    });

    it("saves and returns rich JSON preference values", async () => {
      const value = {
        name: true,
        region: false,
        nested: { pinned: ["name", "region"], compact: true },
      };

      const putRes = await app.request("/preferences/datatable.wines.columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      expect(putRes.status).toBe(200);
      await expect(putRes.json()).resolves.toEqual({
        key: "datatable.wines.columns",
        value,
      });

      const getRes = await app.request("/preferences/datatable.wines.columns");
      expect(getRes.status).toBe(200);
      await expect(getRes.json()).resolves.toEqual({
        key: "datatable.wines.columns",
        value,
      });
    });

    it("isolates preferences by authenticated user", async () => {
      await app.request("/preferences/datatable.wines.columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: { region: false } }),
      });

      const otherUserApp = createTestAppWithAuth(
        "user-b",
        "user-b@example.com",
      );
      registerUserPreferenceRoutes(otherUserApp);

      const res = await otherUserApp.request(
        "/preferences/datatable.wines.columns",
      );
      expect(res.status).toBe(404);
    });

    it("deletes a saved preference", async () => {
      await app.request("/preferences/datatable.wines.columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: { region: false } }),
      });

      const deleteRes = await app.request(
        "/preferences/datatable.wines.columns",
        { method: "DELETE" },
      );
      expect(deleteRes.status).toBe(200);
      await expect(deleteRes.json()).resolves.toEqual({ success: true });

      const getRes = await app.request("/preferences/datatable.wines.columns");
      expect(getRes.status).toBe(404);
    });

    it("rejects invalid preference keys", async () => {
      const res = await app.request("/preferences/bad key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: true }),
      });

      expect(res.status).toBe(400);
    });

    it("does not expose user preferences in the system settings list", async () => {
      await app.request("/preferences/datatable.wines.columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: { region: false } }),
      });

      const settingsApp = createTestApp();
      registerSettingsRoutes(settingsApp);

      const res = await settingsApp.request("/settings");
      expect(res.status).toBe(200);
      const settings = await res.json();
      expect(settings).toEqual([]);
    });
  });
});
