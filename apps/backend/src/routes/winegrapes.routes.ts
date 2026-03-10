import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CreateWineGrape, UpdateWineGrape } from "@cellarboss/types";
import * as winegrapesController from "@controllers/winegrapes.controller.js";
import {
  createWineGrapeSchema,
  updateWineGrapeSchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes, jsonContent } from "@openapi/helpers.js";
import { wineGrapeResponseSchema, errorSchema } from "@openapi/schemas.js";

const crudRoutes = createCrudRoutes({
  tag: "Wine Grapes",
  resourceName: "wine grape",
  createSchema: createWineGrapeSchema,
  updateSchema: updateWineGrapeSchema,
  responseSchema: wineGrapeResponseSchema,
});

const wineIdParamSchema = z.object({
  wineId: z.string().openapi({ description: "Wine ID", example: "1" }),
});

const getByWineRoute = createRoute({
  method: "get",
  path: "/wine/{wineId}",
  tags: ["Wine Grapes"],
  security: [{ cookieAuth: [] }],
  summary: "Get grape associations by wine ID",
  request: { params: wineIdParamSchema },
  responses: {
    200: jsonContent(wineGrapeResponseSchema.array(), "List of wine-grape associations"),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

export function registerWineGrapeRoutes(app: OpenAPIHono) {
  const winegrape = new OpenAPIHono();

  winegrape.use("*", requireAuth);

  winegrape.openapi(crudRoutes.list, async (c) => {
    const data = await winegrapesController.list();
    return c.json(data, 200);
  });

  winegrape.openapi(crudRoutes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await winegrapesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  winegrape.openapi(getByWineRoute, async (c) => {
    const wineId = parseId(c.req.param("wineId"));
    if (wineId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await winegrapesController.getByWineId(wineId);
    return c.json(data, 200);
  });

  winegrape.openapi(crudRoutes.create, async (c) => {
    const body = c.req.valid("json") as CreateWineGrape;
    const data = await winegrapesController.create(body);
    return c.json(data, 201);
  });

  winegrape.openapi(crudRoutes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateWineGrape;
    const data = await winegrapesController.update(id, body);
    return c.json(data, 200);
  });

  winegrape.openapi(crudRoutes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await winegrapesController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/winegrape", winegrape);
}
