import { OpenAPIHono } from "@hono/zod-openapi";
import type { CreateRegion, UpdateRegion } from "@cellarboss/types";
import * as regionsController from "@controllers/regions.controller.js";
import { createRegionSchema, updateRegionSchema } from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes } from "@openapi/helpers.js";
import { regionResponseSchema } from "@openapi/schemas.js";

const routes = createCrudRoutes({
  tag: "Regions",
  resourceName: "region",
  createSchema: createRegionSchema,
  updateSchema: updateRegionSchema,
  responseSchema: regionResponseSchema,
});

export function registerRegionRoutes(app: OpenAPIHono) {
  const region = new OpenAPIHono();

  region.use("*", requireAuth);

  region.openapi(routes.list, async (c) => {
    const data = await regionsController.list();
    return c.json(data, 200);
  });

  region.openapi(routes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await regionsController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  region.openapi(routes.create, async (c) => {
    const body = c.req.valid("json") as CreateRegion;
    const data = await regionsController.create(body);
    return c.json(data, 201);
  });

  region.openapi(routes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateRegion;
    const data = await regionsController.update(id, body);
    return c.json(data, 200);
  });

  region.openapi(routes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await regionsController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/region", region);
}
