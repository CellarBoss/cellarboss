import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { Hono } from "hono";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
} from "./setup.js";
import { registerLocationRoutes } from "@routes/locations.routes.js";
import { db } from "@utils/database.js";

describe("Location API", () => {
  beforeAll(async () => {
    await runMigrations(db);
  });
  describe("without auth", () => {
    let app: Hono;

    beforeEach(() => {
      app = createTestApp();
      registerLocationRoutes(app);
    });

    it("GET /location returns 401", async () => {
      const res = await app.request("/location");
      expect(res.status).toBe(401);
    });

    it("POST /location returns 401", async () => {
      const res = await app.request("/location", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /location/:id returns 401", async () => {
      const res = await app.request("/location/1");
      expect(res.status).toBe(401);
    });

    it("PUT /location/:id returns 401", async () => {
      const res = await app.request("/location/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /location/:id returns 401", async () => {
      const res = await app.request("/location/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: Hono;

    beforeEach(() => {
      app = createTestAppWithAuth();
      registerLocationRoutes(app);
    });

    describe("GET /location", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/location");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe("POST /location", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a location with valid data", async () => {
        const res = await app.request("/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Wine Cellar" }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.name).toBe("Wine Cellar");
      });
    });

    describe("GET /location/:id", () => {
      it("returns 404 for non-existent location", async () => {
        const res = await app.request("/location/999");
        expect(res.status).toBe(404);
      });

      it("returns location by id", async () => {
        const createRes = await app.request("/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Kitchen" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/location/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.name).toBe("Kitchen");
      });
    });

    describe("PUT /location/:id", () => {
      it("updates a location", async () => {
        const createRes = await app.request("/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Basement" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/location/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Basement Cellar" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.name).toBe("Basement Cellar");
      });
    });

    describe("DELETE /location/:id", () => {
      it("deletes a location", async () => {
        const createRes = await app.request("/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Garage" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/location/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });
    });
  });
});
