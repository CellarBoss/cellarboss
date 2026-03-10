import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
  createTestWine,
  createTestWineMaker,
  createTestRegion,
  createTestCountry,
} from "./setup.js";
import { registerVintageRoutes } from "@routes/vintages.routes.js";
import { db } from "@utils/database.js";

describe("Vintage API", () => {
  let testWineId: number;

  beforeAll(async () => {
    await runMigrations(db);
  });

  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerVintageRoutes(app);
    });

    it("GET /vintage returns 401", async () => {
      const res = await app.request("/vintage");
      expect(res.status).toBe(401);
    });

    it("POST /vintage returns 401", async () => {
      const res = await app.request("/vintage", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /vintage/:id returns 401", async () => {
      const res = await app.request("/vintage/1");
      expect(res.status).toBe(401);
    });

    it("PUT /vintage/:id returns 401", async () => {
      const res = await app.request("/vintage/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /vintage/:id returns 401", async () => {
      const res = await app.request("/vintage/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: OpenAPIHono;

    beforeEach(async () => {
      // Create prerequisite data
      const wineMaker = await createTestWineMaker(db, "Château Latour");
      const country = await createTestCountry(db, "France");
      const region = await createTestRegion(db, country.id, "Pauillac");
      const wine = await createTestWine(
        db,
        wineMaker.id,
        region.id,
        "Château Latour",
      );
      testWineId = wine.id;

      app = createTestAppWithAuth();
      registerVintageRoutes(app);
    });

    describe("GET /vintage", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/vintage");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe("POST /vintage", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/vintage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a vintage with valid data", async () => {
        const res = await app.request("/vintage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: 2015,
            wineId: testWineId,
            drinkFrom: 2020,
            drinkUntil: 2030,
          }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.year).toBe(2015);
        expect(data.wineId).toBe(testWineId);
      });
    });

    describe("GET /vintage/:id", () => {
      it("returns 404 for non-existent vintage", async () => {
        const res = await app.request("/vintage/999");
        expect(res.status).toBe(404);
      });

      it("returns vintage by id", async () => {
        const createRes = await app.request("/vintage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: 2018,
            wineId: testWineId,
            drinkFrom: null,
            drinkUntil: null,
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/vintage/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.year).toBe(2018);
      });
    });

    describe("PUT /vintage/:id", () => {
      it("updates a vintage", async () => {
        const createRes = await app.request("/vintage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: 2019,
            wineId: testWineId,
            drinkFrom: 2023,
            drinkUntil: 2035,
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/vintage/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drinkUntil: 2040 }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.drinkUntil).toBe(2040);
      });
    });

    describe("DELETE /vintage/:id", () => {
      it("deletes a vintage", async () => {
        const createRes = await app.request("/vintage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: 2020,
            wineId: testWineId,
            drinkFrom: null,
            drinkUntil: null,
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/vintage/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });
    });
  });
});
