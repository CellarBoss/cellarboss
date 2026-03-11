import { OpenAPIHono } from "@hono/zod-openapi";
import type { CreateStorage, UpdateStorage } from "@cellarboss/types";
import * as storagesController from "@controllers/storages.controller.js";
import {
  createStorageSchema,
  updateStorageSchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes } from "@openapi/helpers.js";
import { storageResponseSchema } from "@openapi/schemas.js";

const routes = createCrudRoutes({
  tag: "Storages",
  resourceName: "storage",
  createSchema: createStorageSchema,
  updateSchema: updateStorageSchema,
  responseSchema: storageResponseSchema,
});

export function registerStorageRoutes(app: OpenAPIHono) {
  const storage = new OpenAPIHono();

  storage.use("*", requireAuth);

  storage.openapi(routes.list, async (c) => {
    const data = await storagesController.list();
    return c.json(data, 200);
  });

  storage.openapi(routes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await storagesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  storage.openapi(routes.create, async (c) => {
    const body = c.req.valid("json") as CreateStorage;
    const data = await storagesController.create(body);
    return c.json(data, 201);
  });

  storage.openapi(routes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateStorage;
    const data = await storagesController.update(id, body);
    return c.json(data, 200);
  });

  storage.openapi(routes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await storagesController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/storage", storage);
}
