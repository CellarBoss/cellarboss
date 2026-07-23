import { describe, it, expect, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  runMigrations,
  cleanDatabase,
  createTestCountry,
  createTestRegion,
  createTestGrape,
  createTestWineMaker,
  createTestWine,
  createTestVintage,
  createTestLocation,
  createTestStorage,
  createTestUser,
} from "./setup";
import { registerMcpRoutes } from "@mcp/route.js";
import * as bottlesController from "@controllers/bottles.controller.js";
import * as tastingNotesController from "@controllers/tasting-notes.controller.js";
import { db } from "@utils/database.js";

async function rpc(
  app: OpenAPIHono,
  method: string,
  params: unknown,
  id: number,
) {
  const res = await app.request("/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  return { status: res.status, body: await res.json() };
}

async function callTool(app: OpenAPIHono, name: string, args: unknown = {}) {
  const res = await rpc(app, "tools/call", { name, arguments: args }, 100);
  return res.body.result;
}

function toolData(result: { content: { text: string }[] }) {
  return JSON.parse(result.content[0].text);
}

describe("MCP server", () => {
  let app: OpenAPIHono;

  beforeAll(async () => {
    await runMigrations(db);
    await cleanDatabase(db);
    await createTestUser(db);

    app = createTestApp();
    registerMcpRoutes(app);

    const init = await rpc(
      app,
      "initialize",
      {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
      1,
    );
    expect(init.status).toBe(200);

    await app.request("/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      }),
    });
  });

  it("lists the read-only tools", async () => {
    const res = await rpc(app, "tools/list", {}, 2);
    expect(res.status).toBe(200);
    const names = res.body.result.tools.map((t: { name: string }) => t.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "list_bottles",
        "get_bottle",
        "list_wines",
        "get_wine",
        "list_storages",
        "get_storage",
        "list_locations",
        "get_location",
        "list_tasting_notes",
        "get_tasting_note",
        "get_tasting_notes_for_vintage",
        "get_tasting_notes_for_wine",
      ]),
    );
  });

  describe("wines (vintage-keyed, enriched)", () => {
    it("get_wine returns winemaker, region/country, grapes, and bottle counts", async () => {
      const country = await createTestCountry(db, "MCP Test Country");
      const region = await createTestRegion(db, country.id, "MCP Test Region");
      const grape = await createTestGrape(db, "MCP Test Grape");
      const wineMaker = await createTestWineMaker(db, "MCP Test Maker");
      const wine = await createTestWine(
        db,
        wineMaker.id,
        region.id,
        "MCP Test Wine",
      );
      await db
        .insertInto("winegrape")
        .values({ wineId: wine.id, grapeId: grape.id })
        .execute();
      const vintage = await createTestVintage(db, wine.id, 2019);
      const bottle = await bottlesController.create({
        purchaseDate: "2024-01-01",
        purchasePrice: 30,
        vintageId: vintage.id,
        storageId: null,
        status: "stored",
        size: "standard",
      });

      const data = toolData(
        await callTool(app, "get_wine", { id: vintage.id }),
      );
      expect(data.id).toBe(vintage.id);
      expect(data.wineId).toBe(wine.id);
      expect(data.name).toBe("MCP Test Wine");
      expect(data.winemaker).toBe("MCP Test Maker");
      expect(data.region).toBe("MCP Test Region");
      expect(data.country).toBe("MCP Test Country");
      expect(data.grapes).toEqual(["MCP Test Grape"]);
      expect(data.year).toBe(2019);
      expect(data.bottleCounts.stored).toBe(1);
      expect(data.averageScore).toBeNull();
      expect(data.noteCount).toBe(0);
      expect(bottle.id).toBeGreaterThan(0);
    });

    it("get_wine reports an error for an unknown vintage id", async () => {
      const result = await callTool(app, "get_wine", { id: 999999 });
      expect(result.isError).toBe(true);
    });

    it("list_wines includes created vintages", async () => {
      const wineMaker = await createTestWineMaker(db, "MCP List Maker");
      const wine = await createTestWine(
        db,
        wineMaker.id,
        null,
        "MCP List Wine",
      );
      const vintage = await createTestVintage(db, wine.id, 2021);

      const data = toolData(await callTool(app, "list_wines"));
      expect(Array.isArray(data)).toBe(true);
      expect(data.some((w: { id: number }) => w.id === vintage.id)).toBe(true);
    });
  });

  describe("bottles (enriched)", () => {
    it("get_bottle embeds wine identity and a resolved storage path/location", async () => {
      const location = await createTestLocation(db, "MCP Cellar Location");
      const root = await createTestStorage(db, location.id, "MCP Cellar");
      await db
        .insertInto("storage")
        .values({ name: "MCP Rack", locationId: location.id, parent: root.id })
        .execute();
      const rack = await db
        .selectFrom("storage")
        .select("id")
        .where("name", "=", "MCP Rack")
        .executeTakeFirstOrThrow();

      const wineMaker = await createTestWineMaker(db, "MCP Bottle Maker");
      const wine = await createTestWine(
        db,
        wineMaker.id,
        null,
        "MCP Bottle Wine",
      );
      const vintage = await createTestVintage(db, wine.id, 2020);
      const bottle = await bottlesController.create({
        purchaseDate: "2024-01-01",
        purchasePrice: 42,
        vintageId: vintage.id,
        storageId: rack.id,
        status: "stored",
        size: "standard",
      });

      const data = toolData(
        await callTool(app, "get_bottle", { id: bottle.id }),
      );
      expect(data.id).toBe(bottle.id);
      expect(data.vintageId).toBe(vintage.id);
      expect(data.wineName).toBe("MCP Bottle Wine");
      expect(data.winemaker).toBe("MCP Bottle Maker");
      expect(data.storagePath).toBe("MCP Cellar > MCP Rack");
      expect(data.location).toBe("MCP Cellar Location");
    });

    it("get_bottle reports an error for an unknown id", async () => {
      const result = await callTool(app, "get_bottle", { id: 999999 });
      expect(result.isError).toBe(true);
    });

    it("list_bottles includes enriched fields", async () => {
      const wineMaker = await createTestWineMaker(db, "MCP List Bottle Maker");
      const wine = await createTestWine(
        db,
        wineMaker.id,
        null,
        "MCP List Bottle Wine",
      );
      const vintage = await createTestVintage(db, wine.id, 2018);
      const bottle = await bottlesController.create({
        purchaseDate: "2024-01-01",
        purchasePrice: 15,
        vintageId: vintage.id,
        storageId: null,
        status: "stored",
        size: "standard",
      });

      const data = toolData(await callTool(app, "list_bottles"));
      const row = data.find((b: { id: number }) => b.id === bottle.id);
      expect(row.wineName).toBe("MCP List Bottle Wine");
      expect(row.storagePath).toBeNull();
      expect(row.location).toBeNull();
    });
  });

  describe("locations and storages", () => {
    it("lists and fetches locations", async () => {
      const location = await createTestLocation(db, "MCP Test Location");

      const list = toolData(await callTool(app, "list_locations"));
      expect(list.some((l: { id: number }) => l.id === location.id)).toBe(true);

      const data = toolData(
        await callTool(app, "get_location", { id: location.id }),
      );
      expect(data.name).toBe("MCP Test Location");
    });

    it("lists and fetches storages", async () => {
      const location = await createTestLocation(db, "MCP Storage Location");
      const storage = await createTestStorage(
        db,
        location.id,
        "MCP Test Storage",
      );

      const list = toolData(await callTool(app, "list_storages"));
      expect(list.some((s: { id: number }) => s.id === storage.id)).toBe(true);

      const data = toolData(
        await callTool(app, "get_storage", { id: storage.id }),
      );
      expect(data.name).toBe("MCP Test Storage");
    });
  });

  describe("tasting notes", () => {
    it("exposes notes via the note tools and as an averageScore/noteCount aggregate on the wine", async () => {
      const wineMaker = await createTestWineMaker(db, "MCP Note Maker");
      const wine = await createTestWine(
        db,
        wineMaker.id,
        null,
        "MCP Note Wine",
      );
      const vintage = await createTestVintage(db, wine.id, 2017);
      const noteA = await tastingNotesController.create({
        vintageId: vintage.id,
        score: 8,
        notes: "Great fruit, well balanced.",
        authorId: "test-user-1",
        date: new Date().toISOString(),
      });
      await tastingNotesController.create({
        vintageId: vintage.id,
        score: 6,
        notes: "A bit tight, needs more time.",
        authorId: "test-user-1",
        date: new Date().toISOString(),
      });

      const wineData = toolData(
        await callTool(app, "get_wine", { id: vintage.id }),
      );
      expect(wineData.noteCount).toBe(2);
      expect(wineData.averageScore).toBe(7);

      const note = toolData(
        await callTool(app, "get_tasting_note", { id: noteA.id }),
      );
      expect(note.score).toBe(8);
      expect(note.author).toBe("Test User");

      const forVintage = toolData(
        await callTool(app, "get_tasting_notes_for_vintage", {
          id: vintage.id,
        }),
      );
      expect(forVintage).toHaveLength(2);

      const forWine = toolData(
        await callTool(app, "get_tasting_notes_for_wine", { id: wine.id }),
      );
      expect(forWine).toHaveLength(2);

      const list = toolData(await callTool(app, "list_tasting_notes"));
      expect(list.some((n: { id: number }) => n.id === noteA.id)).toBe(true);
    });

    it("get_tasting_note reports an error for an unknown id", async () => {
      const result = await callTool(app, "get_tasting_note", { id: 999999 });
      expect(result.isError).toBe(true);
    });
  });
});
