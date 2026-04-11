import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
  cleanDatabase,
  createTestUser,
  createTestVintage,
  createTestWine,
  createTestWineMaker,
} from "./setup";
import { registerTastingNoteRoutes } from "@routes/tasting-notes.routes.js";
import { db } from "@utils/database.js";

describe("Tasting Note API", () => {
  let testVintageId: number;
  let testWineId: number;

  beforeAll(async () => {
    await runMigrations(db);
    await cleanDatabase(db);
    await createTestUser(db);
  });

  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerTastingNoteRoutes(app);
    });

    it("GET /tasting-note returns 401", async () => {
      const res = await app.request("/tasting-note");
      expect(res.status).toBe(401);
    });

    it("POST /tasting-note returns 401", async () => {
      const res = await app.request("/tasting-note", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /tasting-note/:id returns 401", async () => {
      const res = await app.request("/tasting-note/1");
      expect(res.status).toBe(401);
    });

    it("PUT /tasting-note/:id returns 401", async () => {
      const res = await app.request("/tasting-note/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /tasting-note/:id returns 401", async () => {
      const res = await app.request("/tasting-note/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: OpenAPIHono;

    beforeEach(async () => {
      const wineMaker = await createTestWineMaker(db, "Tasting Test Winery");
      const wine = await createTestWine(
        db,
        wineMaker.id,
        null,
        "Tasting Test Wine",
      );
      testWineId = wine.id;
      const vintage = await createTestVintage(db, wine.id, 2020);
      testVintageId = vintage.id;

      app = createTestAppWithAuth();
      registerTastingNoteRoutes(app);
    });

    describe("GET /tasting-note", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/tasting-note");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe("POST /tasting-note", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/tasting-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a tasting note with valid data", async () => {
        const res = await app.request("/tasting-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vintageId: testVintageId,
            score: 8,
            notes: "Excellent wine with great complexity.",
          }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.score).toBe(8);
        expect(data.notes).toBe("Excellent wine with great complexity.");
        expect(data.authorId).toBe("test-user-1");
        expect(data.author).toBe("Test User");
        expect(data).toHaveProperty("date");
      });

      it("rejects score outside 0-10 range", async () => {
        const res = await app.request("/tasting-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vintageId: testVintageId,
            score: 11,
            notes: "Too high",
          }),
        });
        expect(res.status).toBe(400);
      });
    });

    describe("GET /tasting-note/:id", () => {
      it("returns 404 for non-existent note", async () => {
        const res = await app.request("/tasting-note/999");
        expect(res.status).toBe(404);
      });

      it("returns note by id", async () => {
        const createRes = await app.request("/tasting-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vintageId: testVintageId,
            score: 7,
            notes: "Good structure.",
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/tasting-note/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.score).toBe(7);
      });
    });

    describe("invalid ID handling", () => {
      it("GET /tasting-note/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/tasting-note/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("PUT /tasting-note/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/tasting-note/abc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: 5 }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("DELETE /tasting-note/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/tasting-note/abc", {
          method: "DELETE",
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });
    });

    describe("GET /tasting-note/vintage/:vintageId", () => {
      it("returns 400 for non-numeric vintageId", async () => {
        const res = await app.request("/tasting-note/vintage/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("returns empty array for vintage with no notes", async () => {
        const res = await app.request(`/tasting-note/vintage/${testVintageId}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });

      it("returns notes for a vintage", async () => {
        await app.request("/tasting-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vintageId: testVintageId,
            score: 6,
            notes: "Decent.",
          }),
        });

        const res = await app.request(`/tasting-note/vintage/${testVintageId}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.length).toBeGreaterThan(0);
        expect(data[0].vintageId).toBe(testVintageId);
      });
    });

    describe("GET /tasting-note/wine/:wineId", () => {
      it("returns 400 for non-numeric wineId", async () => {
        const res = await app.request("/tasting-note/wine/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("returns notes for a wine (across vintages)", async () => {
        await app.request("/tasting-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vintageId: testVintageId,
            score: 5,
            notes: "Average.",
          }),
        });

        const res = await app.request(`/tasting-note/wine/${testWineId}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.length).toBeGreaterThan(0);
      });
    });

    describe("PUT /tasting-note/:id", () => {
      it("updates a tasting note", async () => {
        const createRes = await app.request("/tasting-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vintageId: testVintageId,
            score: 6,
            notes: "Original notes.",
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/tasting-note/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: 8, notes: "Updated notes." }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.score).toBe(8);
        expect(data.notes).toBe("Updated notes.");
      });
    });

    describe("DELETE /tasting-note/:id", () => {
      it("deletes a tasting note", async () => {
        const createRes = await app.request("/tasting-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vintageId: testVintageId,
            score: 4,
            notes: "To be deleted.",
          }),
        });
        const created = await createRes.json();

        const res = await app.request(`/tasting-note/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });
    });
  });
});
