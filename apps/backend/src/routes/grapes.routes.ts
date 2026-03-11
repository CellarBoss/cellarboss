import { OpenAPIHono } from "@hono/zod-openapi";
import type { CreateGrape, UpdateGrape } from "@cellarboss/types";
import * as grapesController from "@controllers/grapes.controller.js";
import { createGrapeSchema, updateGrapeSchema } from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes } from "@openapi/helpers.js";
import { grapeResponseSchema } from "@openapi/schemas.js";

const routes = createCrudRoutes({
  tag: "Grapes",
  resourceName: "grape",
  createSchema: createGrapeSchema,
  updateSchema: updateGrapeSchema,
  responseSchema: grapeResponseSchema,
});

export function registerGrapeRoutes(app: OpenAPIHono) {
  const grape = new OpenAPIHono();

  grape.use("*", requireAuth);

  grape.openapi(routes.list, async (c) => {
    const data = await grapesController.list();
    return c.json(data, 200);
  });

  grape.openapi(routes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await grapesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  grape.openapi(routes.create, async (c) => {
    const body = c.req.valid("json") as CreateGrape;
    const data = await grapesController.create(body);
    return c.json(data, 201);
  });

  grape.openapi(routes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateGrape;
    const data = await grapesController.update(id, body);
    return c.json(data, 200);
  });

  grape.openapi(routes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await grapesController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/grape", grape);
}
