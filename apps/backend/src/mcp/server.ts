import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as storagesController from "@controllers/storages.controller.js";
import * as locationsController from "@controllers/locations.controller.js";
import {
  listEnrichedWines,
  getEnrichedWine,
  listEnrichedBottles,
  getEnrichedBottle,
} from "./queries.js";
import { env } from "@utils/env.js";

export const mcpServer = new McpServer({
  name: "cellarboss",
  version: env.APP_VERSION,
});

function jsonResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
}

function notFoundResult(entity: string, id: number) {
  return {
    content: [{ type: "text" as const, text: `${entity} ${id} not found` }],
    isError: true,
  };
}

mcpServer.registerTool(
  "list_bottles",
  {
    description:
      "List every bottle in the cellar inventory, with the wine/vintage it holds and its resolved storage location embedded (storagePath and location) rather than raw ids",
  },
  async () => jsonResult(await listEnrichedBottles()),
);

mcpServer.registerTool(
  "get_bottle",
  {
    description:
      "Get a single bottle by its id, with the wine/vintage it holds and its resolved storage location embedded (storagePath and location) rather than raw ids",
    inputSchema: { id: z.number().int() },
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
      "List every wine, one row per vintage, with winemaker, region/country, grape varieties, drinking window, and bottle counts by status embedded. The id field is the vintage id",
  },
  async () => jsonResult(await listEnrichedWines()),
);

mcpServer.registerTool(
  "get_wine",
  {
    description:
      "Get a single wine at a specific vintage, with winemaker, region/country, grape varieties, drinking window, and bottle counts by status embedded. id is the vintage id, as returned by list_wines",
    inputSchema: { id: z.number().int() },
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
  },
  async () => jsonResult(await storagesController.list()),
);

mcpServer.registerTool(
  "get_storage",
  {
    description: "Get a single storage unit by its id",
    inputSchema: { id: z.number().int() },
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
  },
  async () => jsonResult(await locationsController.list()),
);

mcpServer.registerTool(
  "get_location",
  {
    description: "Get a single location by its id",
    inputSchema: { id: z.number().int() },
  },
  async ({ id }) => {
    const location = await locationsController.getById(id);
    return location ? jsonResult(location) : notFoundResult("Location", id);
  },
);
