import { describe, it, expect, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Bottle } from "@cellarboss/types";
import {
  createTestAppWithAuth,
  runMigrations,
  cleanDatabase,
  createTestWine,
  createTestWineMaker,
  createTestVintage,
  createTestUser,
} from "./setup";
import { registerWineRoutes } from "@routes/wines.routes.js";
import { registerVintageRoutes } from "@routes/vintages.routes.js";
import { db } from "@utils/database.js";

async function addBottle(vintageId: number, status: Bottle["status"]) {
  await db
    .insertInto("bottle")
    .values({
      vintageId,
      status,
      purchaseDate: "2024-01-01",
      purchasePrice: 20,
      storageId: null,
      size: "standard",
    })
    .execute();
}

async function addTastingNote(vintageId: number) {
  await db
    .insertInto("tastingNote")
    .values({
      vintageId,
      authorId: "test-user-1",
      date: new Date().toISOString(),
      score: 8,
      notes: "Lovely",
    })
    .execute();
}

describe("Embedded counts on wine and vintage reads", () => {
  let app: OpenAPIHono;
  let wineId: number;
  let emptyWineId: number;
  let vintage2015: number;
  let vintage2016: number;
  let emptyVintage: number;

  beforeAll(async () => {
    await runMigrations(db);
    await cleanDatabase(db);
    await createTestUser(db);

    const wineMaker = await createTestWineMaker(db, "Counts Estate");
    wineId = (await createTestWine(db, wineMaker.id, null, "Counted Wine")).id;
    emptyWineId = (await createTestWine(db, wineMaker.id, null, "Empty Wine"))
      .id;

    vintage2015 = (await createTestVintage(db, wineId, 2015)).id;
    vintage2016 = (await createTestVintage(db, wineId, 2016)).id;
    emptyVintage = (await createTestVintage(db, emptyWineId, 2020)).id;

    await addBottle(vintage2015, "stored");
    await addBottle(vintage2015, "stored");
    await addBottle(vintage2015, "drunk");
    await addBottle(vintage2016, "ordered");

    await addTastingNote(vintage2015);
    await addTastingNote(vintage2015);
    await addTastingNote(vintage2016);

    app = createTestAppWithAuth();
    registerWineRoutes(app);
    registerVintageRoutes(app);
  });

  describe("wines", () => {
    it("GET /wine counts tasting notes across all vintages", async () => {
      const res = await app.request("/wine");
      expect(res.status).toBe(200);
      const data = await res.json();
      const counted = data.find((w: { id: number }) => w.id === wineId);
      const empty = data.find((w: { id: number }) => w.id === emptyWineId);
      expect(counted.tastingNotesCount).toBe(3);
      expect(empty.tastingNotesCount).toBe(0);
    });

    it("GET /wine/:id includes the tasting note count", async () => {
      const res = await app.request(`/wine/${wineId}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.tastingNotesCount).toBe(3);
    });

    it("POST /wine does not include counts", async () => {
      const wine = await (await app.request(`/wine/${wineId}`)).json();
      const res = await app.request("/wine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Uncounted Wine",
          wineMakerId: wine.wineMakerId,
          regionId: null,
          type: "red",
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).not.toHaveProperty("tastingNotesCount");
    });
  });

  describe("vintages", () => {
    it("GET /vintage/:id includes zero-filled bottle counts and note count", async () => {
      const res = await app.request(`/vintage/${vintage2015}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.tastingNotesCount).toBe(2);
      expect(data.bottles).toEqual({
        ordered: 0,
        stored: 2,
        "in-primeur": 0,
        drunk: 1,
        sold: 0,
        gifted: 0,
      });
    });

    it("GET /vintage/wine/:wineId includes counts for each vintage", async () => {
      const res = await app.request(`/vintage/wine/${wineId}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      const byId = new Map(data.map((v: { id: number }) => [v.id, v] as const));
      expect(byId.get(vintage2015)).toMatchObject({
        tastingNotesCount: 2,
        bottles: { stored: 2, drunk: 1 },
      });
      expect(byId.get(vintage2016)).toMatchObject({
        tastingNotesCount: 1,
        bottles: { ordered: 1, stored: 0 },
      });
    });

    it("GET /vintage returns zero counts for a vintage with no bottles or notes", async () => {
      const res = await app.request("/vintage");
      expect(res.status).toBe(200);
      const data = await res.json();
      const empty = data.find((v: { id: number }) => v.id === emptyVintage);
      expect(empty.tastingNotesCount).toBe(0);
      expect(Object.values(empty.bottles)).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it("PUT /vintage/:id does not include counts", async () => {
      const res = await app.request(`/vintage/${vintage2016}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drinkFrom: 2020 }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).not.toHaveProperty("bottles");
      expect(data).not.toHaveProperty("tastingNotesCount");
    });
  });
});
