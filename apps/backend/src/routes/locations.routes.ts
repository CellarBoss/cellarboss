import { OpenAPIHono } from "@hono/zod-openapi";
import type { CreateLocation, UpdateLocation } from "@cellarboss/types";
import * as locationsController from "@controllers/locations.controller.js";
import {
  createLocationSchema,
  updateLocationSchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes } from "@openapi/helpers.js";
import { locationResponseSchema } from "@openapi/schemas.js";

const routes = createCrudRoutes({
  tag: "Locations",
  resourceName: "location",
  createSchema: createLocationSchema,
  updateSchema: updateLocationSchema,
  responseSchema: locationResponseSchema,
});

export function registerLocationRoutes(app: OpenAPIHono) {
  const location = new OpenAPIHono();

  location.use("*", requireAuth);

  location.openapi(routes.list, async (c) => {
    const data = await locationsController.list();
    return c.json(data, 200);
  });

  location.openapi(routes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await locationsController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  location.openapi(routes.create, async (c) => {
    const body = c.req.valid("json") as CreateLocation;
    const data = await locationsController.create(body);
    return c.json(data, 201);
  });

  location.openapi(routes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateLocation;
    const data = await locationsController.update(id, body);
    return c.json(data, 200);
  });

  location.openapi(routes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await locationsController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/location", location);
}
