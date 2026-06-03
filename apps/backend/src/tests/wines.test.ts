import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
  cleanDatabase,
  createTestWineMaker,
  createTestRegion,
  createTestCountry,
  createTestGrape,
  createTestVintage,
  createTestUser,
} from "./setup";
import { registerWineRoutes } from "@routes/wines.routes.js";
import { db } from "@utils/database.js";

describe("Wine API", () => {
  let testWineMakerId: number;
  let testRegionId: number;

  beforeAll(async () => {
    await runMigrations(db);
    await cleanDatabase(db);
    await createTestUser(db);
  });

  async function createTastingNote(
    vintageId: number,
    notes: string = "Test tasting note",
  ) {
    await db
      .insertInto("tastingNote")
      .values({
        vintageId,
        date: new Date().toISOString(),
        authorId: "test-user-1",
        score: 8,
        notes,
      })
      .execute();
  }

  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerWineRoutes(app);
    });

    it("GET /wine returns 401", async () => {
      const res = await app.request("/wine");
      expect(res.status).toBe(401);
    });

    it("POST /wine returns 401", async () => {
      const res = await app.request("/wine", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /wine/:id returns 401", async () => {
      const res = await app.request("/wine/1");
      expect(res.status).toBe(401);
    });

    it("PUT /wine/:id returns 401", async () => {
      const res = await app.request("/wine/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /wine/:id returns 401", async () => {
      const res = await app.request("/wine/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: OpenAPIHono;

    beforeEach(async () => {
      // Create prerequisite data
      const wineMaker = await createTestWineMaker(db, "Château Margaux Estate");
      testWineMakerId = wineMaker.id;

      const country = await createTestCountry(db, "France");
      const region = await createTestRegion(db, country.id, "Bordeaux");
      testRegionId = region.id;

      app = createTestAppWithAuth();
      registerWineRoutes(app);
    });

    describe("GET /wine", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/wine");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });

      it("includes tasting note counts for each wine", async () => {
        const createRes = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Counted List Wine",
            wineMakerId: testWineMakerId,
            regionId: testRegionId,
            type: "red",
          }),
        });
        const created = await createRes.json();
        const firstVintage = await createTestVintage(db, created.id, 2018);
        const secondVintage = await createTestVintage(db, created.id, 2019);

        await createTastingNote(firstVintage.id, "First vintage note");
        await createTastingNote(firstVintage.id, "Second vintage note");
        await createTastingNote(secondVintage.id, "Another vintage note");

        const res = await app.request("/wine");
        expect(res.status).toBe(200);
        const data = await res.json();
        const wine = data.find((item: any) => item.id === created.id);

        expect(wine).toBeDefined();
        expect(wine.tastingNotesCount).toBe(3);
      });
    });

    describe("POST /wine", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a wine with valid data", async () => {
        const res = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Château Margaux",
            wineMakerId: testWineMakerId,
            regionId: testRegionId,
            type: "red",
          }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.name).toBe("Château Margaux");
        expect(data.tastingNotesCount).toBe(0);
      });
    });

    describe("GET /wine/:id", () => {
      it("returns 404 for non-existent wine", async () => {
        const res = await app.request("/wine/999");
        expect(res.status).toBe(404);
      });

      it("returns wine by id", async () => {
        const createRes = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Opus One",
            wineMakerId: testWineMakerId,
            regionId: null,
            type: "red",
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/wine/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.name).toBe("Opus One");
        expect(data.tastingNotesCount).toBe(0);
      });

      it("returns tasting note count across wine vintages", async () => {
        const createRes = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Counted Detail Wine",
            wineMakerId: testWineMakerId,
            regionId: null,
            type: "red",
          }),
        });
        const created = await createRes.json();
        const firstVintage = await createTestVintage(db, created.id, 2021);
        const secondVintage = await createTestVintage(db, created.id, 2022);

        await createTastingNote(firstVintage.id, "First detail note");
        await createTastingNote(secondVintage.id, "Second detail note");

        const res = await app.request(`/wine/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.tastingNotesCount).toBe(2);
      });
    });

    describe("invalid ID handling", () => {
      it("GET /wine/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/wine/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("PUT /wine/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/wine/abc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test" }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("DELETE /wine/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/wine/abc", { method: "DELETE" });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });
    });

    describe("PUT /wine/:id", () => {
      it("updates a wine", async () => {
        const createRes = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Penfolds Grange",
            wineMakerId: testWineMakerId,
            regionId: null,
            type: "red",
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/wine/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regionId: testRegionId }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.regionId).toBe(testRegionId);
        expect(data.tastingNotesCount).toBe(0);
      });

      it("preserves non-zero tasting note count when updating a wine", async () => {
        const createRes = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Counted Update Wine",
            wineMakerId: testWineMakerId,
            regionId: null,
            type: "red",
          }),
        });
        const created = await createRes.json();
        const vintage = await createTestVintage(db, created.id, 2023);

        await createTastingNote(vintage.id, "Update note one");
        await createTastingNote(vintage.id, "Update note two");

        const res = await app.request(`/wine/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regionId: testRegionId }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.regionId).toBe(testRegionId);
        expect(data.tastingNotesCount).toBe(2);
      });
    });

    describe("DELETE /wine/:id", () => {
      it("deletes a wine", async () => {
        const createRes = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dom Pérignon",
            wineMakerId: testWineMakerId,
            regionId: null,
            type: "sparkling",
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/wine/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });

      it("cascade-deletes winegrape records when deleting a wine", async () => {
        const wine = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Cascade Test Wine",
            wineMakerId: testWineMakerId,
            regionId: null,
            type: "red",
          }),
        });
        const createdWine = await wine.json();

        const grape = await createTestGrape(db, "Shiraz");
        await db
          .insertInto("winegrape")
          .values({ wineId: createdWine.id, grapeId: grape.id })
          .execute();

        const res = await app.request(`/wine/${createdWine.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);

        const remaining = await db
          .selectFrom("winegrape")
          .selectAll()
          .where("wineId", "=", createdWine.id)
          .execute();
        expect(remaining).toHaveLength(0);
      });

      it("returns 409 when wine has vintages", async () => {
        const wine = await app.request("/wine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Vintage Block Test Wine",
            wineMakerId: testWineMakerId,
            regionId: null,
            type: "red",
          }),
        });
        const createdWine = await wine.json();

        await createTestVintage(db, createdWine.id, 2020);

        const res = await app.request(`/wine/${createdWine.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.error).toContain("still has vintages");
      });
    });
  });
});
