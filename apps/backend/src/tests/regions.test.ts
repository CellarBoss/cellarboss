import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
  createTestCountry,
} from "./setup";
import { registerRegionRoutes } from "@routes/regions.routes.js";
import { db } from "@utils/database.js";

describe("Region API", () => {
  let testCountryId: number;

  beforeAll(async () => {
    await runMigrations(db);
  });

  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerRegionRoutes(app);
    });

    it("GET /region returns 401", async () => {
      const res = await app.request("/region");
      expect(res.status).toBe(401);
    });

    it("POST /region returns 401", async () => {
      const res = await app.request("/region", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /region/:id returns 401", async () => {
      const res = await app.request("/region/1");
      expect(res.status).toBe(401);
    });

    it("PUT /region/:id returns 401", async () => {
      const res = await app.request("/region/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /region/:id returns 401", async () => {
      const res = await app.request("/region/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: OpenAPIHono;

    beforeEach(async () => {
      // Create prerequisite data
      const country = await createTestCountry(db, "France");
      testCountryId = country.id;

      app = createTestAppWithAuth();
      registerRegionRoutes(app);
    });

    describe("GET /region", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/region");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe("POST /region", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/region", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a region with valid data", async () => {
        const res = await app.request("/region", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Bordeaux", countryId: testCountryId }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.name).toBe("Bordeaux");
        expect(data.countryId).toBe(testCountryId);
      });
    });

    describe("GET /region/:id", () => {
      it("returns 404 for non-existent region", async () => {
        const res = await app.request("/region/999");
        expect(res.status).toBe(404);
      });

      it("returns region by id", async () => {
        const createRes = await app.request("/region", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Burgundy", countryId: testCountryId }),
        });
        const created = await createRes.json();

        const res = await app.request(`/region/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.name).toBe("Burgundy");
      });
    });

    describe("invalid ID handling", () => {
      it("GET /region/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/region/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("PUT /region/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/region/abc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test" }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("DELETE /region/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/region/abc", { method: "DELETE" });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });
    });

    describe("PUT /region/:id", () => {
      it("updates a region", async () => {
        const createRes = await app.request("/region", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Champagne", countryId: testCountryId }),
        });
        const created = await createRes.json();

        const res = await app.request(`/region/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Champagne (AOC)" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.name).toBe("Champagne (AOC)");
      });
    });

    describe("DELETE /region/:id", () => {
      it("deletes a region", async () => {
        const createRes = await app.request("/region", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Alsace", countryId: testCountryId }),
        });
        const created = await createRes.json();

        const res = await app.request(`/region/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });
    });
  });
});
