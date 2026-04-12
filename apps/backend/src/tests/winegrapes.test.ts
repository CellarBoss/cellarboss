import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
  cleanDatabase,
  createTestWine,
  createTestWineMaker,
  createTestGrape,
} from "./setup";
import { registerWineGrapeRoutes } from "@routes/winegrapes.routes.js";
import { db } from "@utils/database.js";

describe("WineGrape API", () => {
  let testWineId: number;
  let testGrapeId: number;

  beforeAll(async () => {
    await runMigrations(db);
    await cleanDatabase(db);
  });

  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerWineGrapeRoutes(app);
    });

    it("GET /winegrape returns 401", async () => {
      const res = await app.request("/winegrape");
      expect(res.status).toBe(401);
    });

    it("POST /winegrape returns 401", async () => {
      const res = await app.request("/winegrape", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /winegrape/:id returns 401", async () => {
      const res = await app.request("/winegrape/1");
      expect(res.status).toBe(401);
    });

    it("PUT /winegrape/:id returns 401", async () => {
      const res = await app.request("/winegrape/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /winegrape/:id returns 401", async () => {
      const res = await app.request("/winegrape/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: OpenAPIHono;

    beforeEach(async () => {
      // Create prerequisite data
      const wineMaker = await createTestWineMaker(db, "Test Estate");
      const wine = await createTestWine(db, wineMaker.id, null, "Test Wine");
      testWineId = wine.id;

      const grape = await createTestGrape(db, "Cabernet Sauvignon");
      testGrapeId = grape.id;

      app = createTestAppWithAuth();
      registerWineGrapeRoutes(app);
    });

    describe("GET /winegrape", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/winegrape");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe("POST /winegrape", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/winegrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a winegrape with valid data", async () => {
        const res = await app.request("/winegrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wineId: testWineId, grapeId: testGrapeId }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.wineId).toBe(testWineId);
        expect(data.grapeId).toBe(testGrapeId);
      });
    });

    describe("GET /winegrape/:id", () => {
      it("returns 404 for non-existent winegrape", async () => {
        const res = await app.request("/winegrape/999");
        expect(res.status).toBe(404);
      });

      it("returns winegrape by id", async () => {
        const createRes = await app.request("/winegrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wineId: testWineId, grapeId: testGrapeId }),
        });
        const created = await createRes.json();

        const res = await app.request(`/winegrape/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.wineId).toBe(testWineId);
      });
    });

    describe("invalid ID handling", () => {
      it("GET /winegrape/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/winegrape/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("GET /winegrape/wine/:wineId returns 400 for non-numeric id", async () => {
        const res = await app.request("/winegrape/wine/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("PUT /winegrape/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/winegrape/abc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grapeId: testGrapeId }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("DELETE /winegrape/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/winegrape/abc", { method: "DELETE" });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });
    });

    describe("GET /winegrape/wine/:id", () => {
      it("returns empty for non-existent wine", async () => {
        const res = await app.request("/winegrape/wine/999");
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
      });

      it("returns winegrape by wine id", async () => {
        await app.request("/winegrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wineId: testWineId, grapeId: testGrapeId }),
        });

        const res = await app.request(`/winegrape/wine/${testWineId}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data[0].wineId).toBe(testWineId);
      });
    });

    describe("PUT /winegrape/:id", () => {
      it("updates a winegrape", async () => {
        // Create a second grape for updating to
        const grape2 = await createTestGrape(db, "Merlot");

        const createRes = await app.request("/winegrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wineId: testWineId, grapeId: testGrapeId }),
        });
        const created = await createRes.json();

        const res = await app.request(`/winegrape/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grapeId: grape2.id }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.grapeId).toBe(grape2.id);
      });
    });

    describe("DELETE /winegrape/:id", () => {
      it("deletes a winegrape", async () => {
        const createRes = await app.request("/winegrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wineId: testWineId, grapeId: testGrapeId }),
        });
        const created = await createRes.json();

        const res = await app.request(`/winegrape/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });
    });
  });
});
