import { describe, it, expect, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  runMigrations,
  cleanDatabase,
  createTestWineMaker,
  createTestWine,
  createTestVintage,
  createTestLocation,
  createTestStorage,
} from "./setup";
import { registerMcpRoutes } from "@mcp/route.js";
import * as bottlesController from "@controllers/bottles.controller.js";
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
      ]),
    );
  });

  describe("wines", () => {
    it("get_wine returns a wine by id", async () => {
      const wineMaker = await createTestWineMaker(db, "MCP Test Maker");
      const wine = await createTestWine(
        db,
        wineMaker.id,
        null,
        "MCP Test Wine",
      );

      const data = toolData(await callTool(app, "get_wine", { id: wine.id }));
      expect(data.id).toBe(wine.id);
      expect(data.name).toBe("MCP Test Wine");
    });

    it("get_wine reports an error for an unknown id", async () => {
      const result = await callTool(app, "get_wine", { id: 999999 });
      expect(result.isError).toBe(true);
    });

    it("list_wines includes created wines", async () => {
      const wineMaker = await createTestWineMaker(db, "MCP List Maker");
      const wine = await createTestWine(
        db,
        wineMaker.id,
        null,
        "MCP List Wine",
      );

      const data = toolData(await callTool(app, "list_wines"));
      expect(Array.isArray(data)).toBe(true);
      expect(data.some((w: { id: number }) => w.id === wine.id)).toBe(true);
    });
  });

  describe("bottles", () => {
    it("get_bottle returns a bottle by id", async () => {
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
        storageId: null,
        status: "stored",
        size: "standard",
      });

      const data = toolData(
        await callTool(app, "get_bottle", { id: bottle.id }),
      );
      expect(data.id).toBe(bottle.id);
      expect(data.vintageId).toBe(vintage.id);
    });

    it("get_bottle reports an error for an unknown id", async () => {
      const result = await callTool(app, "get_bottle", { id: 999999 });
      expect(result.isError).toBe(true);
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
});
