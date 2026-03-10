import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CreateBottle, UpdateBottle } from "@cellarboss/types";
import * as bottlesController from "@controllers/bottles.controller.js";
import { createBottleSchema, updateBottleSchema } from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes, jsonContent } from "@openapi/helpers.js";
import {
  bottleResponseSchema,
  bottleCountsResponseSchema,
  errorSchema,
} from "@openapi/schemas.js";

const crudRoutes = createCrudRoutes({
  tag: "Bottles",
  resourceName: "bottle",
  createSchema: createBottleSchema,
  updateSchema: updateBottleSchema,
  responseSchema: bottleResponseSchema,
});

const vintageIdParamSchema = z.object({
  vintageId: z
    .string()
    .openapi({ description: "Vintage ID", example: "1" }),
});

const getByVintageRoute = createRoute({
  method: "get",
  path: "/vintage/{vintageId}",
  tags: ["Bottles"],
  security: [{ cookieAuth: [] }],
  summary: "Get bottles by vintage ID",
  request: { params: vintageIdParamSchema },
  responses: {
    200: jsonContent(bottleResponseSchema.array(), "List of bottles for the vintage"),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

const getCountsByVintageRoute = createRoute({
  method: "get",
  path: "/vintage/{vintageId}/counts",
  tags: ["Bottles"],
  security: [{ cookieAuth: [] }],
  summary: "Get bottle counts by status for a vintage",
  request: { params: vintageIdParamSchema },
  responses: {
    200: jsonContent(bottleCountsResponseSchema.array(), "Bottle counts grouped by status"),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

export function registerBottleRoutes(app: OpenAPIHono) {
  const bottle = new OpenAPIHono();

  bottle.use("*", requireAuth);

  bottle.openapi(crudRoutes.list, async (c) => {
    const data = await bottlesController.list();
    return c.json(data, 200);
  });

  bottle.openapi(getCountsByVintageRoute, async (c) => {
    const vintageId = parseId(c.req.param("vintageId"));
    if (vintageId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await bottlesController.getCountsByVintageId(vintageId);
    return c.json(data, 200);
  });

  bottle.openapi(getByVintageRoute, async (c) => {
    const vintageId = parseId(c.req.param("vintageId"));
    if (vintageId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await bottlesController.getByVintageId(vintageId);
    return c.json(data, 200);
  });

  bottle.openapi(crudRoutes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await bottlesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  bottle.openapi(crudRoutes.create, async (c) => {
    const body = c.req.valid("json") as CreateBottle;
    const data = await bottlesController.create(body);
    return c.json(data, 201);
  });

  bottle.openapi(crudRoutes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateBottle;
    const data = await bottlesController.update(id, body);
    return c.json(data, 200);
  });

  bottle.openapi(crudRoutes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await bottlesController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/bottle", bottle);
}
