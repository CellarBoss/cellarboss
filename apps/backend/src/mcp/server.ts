import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as storagesController from "@controllers/storages.controller.js";
import * as locationsController from "@controllers/locations.controller.js";
import * as tastingNotesController from "@controllers/tasting-notes.controller.js";
import {
  listEnrichedWines,
  getEnrichedWine,
  listEnrichedBottles,
  getEnrichedBottle,
} from "./queries.js";
import { env } from "@utils/env.js";

function jsonResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
}

function notFoundResult(entity: string, id: number) {
  return {
    content: [{ type: "text" as const, text: `${entity} ${id} not found` }],
    isError: true,
  };
}

const readOnly = { readOnlyHint: true };

// A fresh McpServer must be created per request rather than shared as a
// singleton: the SDK's Protocol.connect() throws if called on an instance
// that's already connected to a transport, and a shared instance would let
// concurrent requests race on internal request-id bookkeeping.
export function createMcpServer() {
  const mcpServer = new McpServer({
    name: "cellarboss",
    version: env.APP_VERSION,
  });

  mcpServer.registerTool(
    "list_bottles",
    {
      description:
        "List every bottle in the cellar inventory, with the wine/vintage it holds and its resolved storage location embedded (storagePath and location) rather than raw ids",
      annotations: readOnly,
    },
    async () => jsonResult(await listEnrichedBottles()),
  );

  mcpServer.registerTool(
    "get_bottle",
    {
      description:
        "Get a single bottle by its id, with the wine/vintage it holds and its resolved storage location embedded (storagePath and location) rather than raw ids",
      inputSchema: { id: z.number().int() },
      annotations: readOnly,
    },
    async ({ id }) => {
      const bottle = await getEnrichedBottle(id);
      return bottle ? jsonResult(bottle) : notFoundResult("Bottle", id);
    },
  );

  mcpServer.registerTool(
    "list_wines",
    {
      description:
        "List every wine, one row per vintage, with winemaker, region/country, grape varieties, drinking window, bottle counts by status, and tasting note averageScore/noteCount embedded. The id field is the vintage id. Use the tasting-note tools to read the actual note text",
      annotations: readOnly,
    },
    async () => jsonResult(await listEnrichedWines()),
  );

  mcpServer.registerTool(
    "get_wine",
    {
      description:
        "Get a single wine at a specific vintage, with winemaker, region/country, grape varieties, drinking window, bottle counts by status, and tasting note averageScore/noteCount embedded. id is the vintage id, as returned by list_wines. Use the tasting-note tools to read the actual note text",
      inputSchema: { id: z.number().int() },
      annotations: readOnly,
    },
    async ({ id }) => {
      const wine = await getEnrichedWine(id);
      return wine ? jsonResult(wine) : notFoundResult("Wine", id);
    },
  );

  mcpServer.registerTool(
    "list_storages",
    {
      description:
        "List every storage unit (the physical cellar, rack, or fridge a bottle is kept in)",
      annotations: readOnly,
    },
    async () => jsonResult(await storagesController.list()),
  );

  mcpServer.registerTool(
    "get_storage",
    {
      description: "Get a single storage unit by its id",
      inputSchema: { id: z.number().int() },
      annotations: readOnly,
    },
    async ({ id }) => {
      const storage = await storagesController.getById(id);
      return storage ? jsonResult(storage) : notFoundResult("Storage", id);
    },
  );

  mcpServer.registerTool(
    "list_locations",
    {
      description:
        "List every location (the site or address a storage unit is located at)",
      annotations: readOnly,
    },
    async () => jsonResult(await locationsController.list()),
  );

  mcpServer.registerTool(
    "get_location",
    {
      description: "Get a single location by its id",
      inputSchema: { id: z.number().int() },
      annotations: readOnly,
    },
    async ({ id }) => {
      const location = await locationsController.getById(id);
      return location ? jsonResult(location) : notFoundResult("Location", id);
    },
  );

  mcpServer.registerTool(
    "list_tasting_notes",
    {
      description:
        "List every tasting note (score 0-10 and free-text notes) across the whole cellar, with the author's name embedded and vintageId linking back to the tasted wine",
      annotations: readOnly,
    },
    async () => jsonResult(await tastingNotesController.list()),
  );

  mcpServer.registerTool(
    "get_tasting_note",
    {
      description: "Get a single tasting note by its id",
      inputSchema: { id: z.number().int() },
      annotations: readOnly,
    },
    async ({ id }) => {
      const note = await tastingNotesController.getById(id);
      return note ? jsonResult(note) : notFoundResult("Tasting note", id);
    },
  );

  mcpServer.registerTool(
    "get_tasting_notes_for_vintage",
    {
      description:
        "List every tasting note recorded for a specific vintage. id is the vintage id, as returned by list_wines/get_wine",
      inputSchema: { id: z.number().int() },
      annotations: readOnly,
    },
    async ({ id }) =>
      jsonResult(await tastingNotesController.getByVintageId(id)),
  );

  mcpServer.registerTool(
    "get_tasting_notes_for_wine",
    {
      description:
        "List every tasting note recorded across all vintages of a wine. id is the wineId field returned by list_wines/get_wine",
      inputSchema: { id: z.number().int() },
      annotations: readOnly,
    },
    async ({ id }) => jsonResult(await tastingNotesController.getByWineId(id)),
  );

  return mcpServer;
}
