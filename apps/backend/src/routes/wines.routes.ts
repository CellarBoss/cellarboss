import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { CreateWine, UpdateWine } from "@cellarboss/types";
import * as winesController from "@controllers/wines.controller.js";
import { createWineSchema, updateWineSchema } from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes, jsonContent } from "@openapi/helpers.js";
import {
  wineResponseSchema,
  errorSchema,
  successSchema,
  idParamSchema,
} from "@openapi/schemas.js";

const crudRoutes = createCrudRoutes({
  tag: "Wines",
  resourceName: "wine",
  createSchema: createWineSchema,
  updateSchema: updateWineSchema,
  responseSchema: wineResponseSchema,
});

// Override delete route to include 409 response
const deleteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Wines"],
  security: [{ cookieAuth: [] }],
  summary: "Delete a wine",
  request: { params: idParamSchema },
  responses: {
    200: jsonContent(successSchema, "Successfully deleted"),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
    409: jsonContent(errorSchema, "Wine still has vintages"),
  },
});

export function registerWineRoutes(app: OpenAPIHono) {
  const wine = new OpenAPIHono();

  wine.use("*", requireAuth);

  wine.openapi(crudRoutes.list, async (c) => {
    const data = await winesController.list();
    return c.json(data, 200);
  });

  wine.openapi(crudRoutes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await winesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  wine.openapi(crudRoutes.create, async (c) => {
    const body = c.req.valid("json") as CreateWine;
    const data = await winesController.create(body);
    return c.json(data, 201);
  });

  wine.openapi(crudRoutes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateWine;
    const data = await winesController.update(id, body);
    return c.json(data, 200);
  });

  wine.openapi(deleteRoute, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    try {
      await winesController.remove(id);
      return c.json({ success: true }, 200);
    } catch (e: any) {
      if (e.message?.includes("still has vintages")) {
        return c.json({ error: e.message }, 409);
      }
      throw e;
    }
  });

  app.route("/wine", wine);
}
