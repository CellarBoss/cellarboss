import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { Hono } from "hono";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
  createTestLocation,
} from "./setup.js";
import { registerStorageRoutes } from "@routes/storages.routes.js";
import { db } from "@utils/database.js";

describe("Storage API", () => {
  let testLocationId: number;

  beforeAll(async () => {
    await runMigrations(db);
  });

  describe("without auth", () => {
    let app: Hono;

    beforeEach(() => {
      app = createTestApp();
      registerStorageRoutes(app);
    });

    it("GET /storage returns 401", async () => {
      const res = await app.request("/storage");
      expect(res.status).toBe(401);
    });

    it("POST /storage returns 401", async () => {
      const res = await app.request("/storage", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /storage/:id returns 401", async () => {
      const res = await app.request("/storage/1");
      expect(res.status).toBe(401);
    });

    it("PUT /storage/:id returns 401", async () => {
      const res = await app.request("/storage/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /storage/:id returns 401", async () => {
      const res = await app.request("/storage/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: Hono;

    beforeEach(async () => {
      // Create prerequisite data
      const location = await createTestLocation(db, "Cellar");
      testLocationId = location.id;

      app = createTestAppWithAuth();
      registerStorageRoutes(app);
    });

    describe("GET /storage", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/storage");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe("POST /storage", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a storage with valid data", async () => {
        const res = await app.request("/storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Rack A",
            locationId: testLocationId,
            parent: null,
          }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.name).toBe("Rack A");
      });
    });

    describe("GET /storage/:id", () => {
      it("returns 404 for non-existent storage", async () => {
        const res = await app.request("/storage/999");
        expect(res.status).toBe(404);
      });

      it("returns storage by id", async () => {
        const createRes = await app.request("/storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Shelf 1",
            locationId: null,
            parent: null,
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/storage/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.name).toBe("Shelf 1");
      });
    });

    describe("PUT /storage/:id", () => {
      it("updates a storage", async () => {
        const createRes = await app.request("/storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Bin A1",
            locationId: null,
            parent: null,
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/storage/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Bin A1 (Updated)" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.name).toBe("Bin A1 (Updated)");
      });
    });

    describe("DELETE /storage/:id", () => {
      it("deletes a storage", async () => {
        const createRes = await app.request("/storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Box 1",
            locationId: null,
            parent: null,
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/storage/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });
    });
  });
});
