import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CreateVintage, UpdateVintage } from "@cellarboss/types";
import * as vintagesController from "@controllers/vintages.controller.js";
import {
  createVintageSchema,
  updateVintageSchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes, jsonContent } from "@openapi/helpers.js";
import { vintageResponseSchema, errorSchema } from "@openapi/schemas.js";

const crudRoutes = createCrudRoutes({
  tag: "Vintages",
  resourceName: "vintage",
  createSchema: createVintageSchema,
  updateSchema: updateVintageSchema,
  responseSchema: vintageResponseSchema,
});

const wineIdParamSchema = z.object({
  wineId: z.string().openapi({ description: "Wine ID", example: "1" }),
});

const getByWineRoute = createRoute({
  method: "get",
  path: "/wine/{wineId}",
  tags: ["Vintages"],
  security: [{ cookieAuth: [] }],
  summary: "Get vintages by wine ID",
  request: { params: wineIdParamSchema },
  responses: {
    200: jsonContent(
      vintageResponseSchema.array(),
      "List of vintages for the wine",
    ),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

export function registerVintageRoutes(app: OpenAPIHono) {
  const vintage = new OpenAPIHono();

  vintage.use("*", requireAuth);

  vintage.openapi(crudRoutes.list, async (c) => {
    const data = await vintagesController.list();
    return c.json(data, 200);
  });

  vintage.openapi(getByWineRoute, async (c) => {
    const wineId = parseId(c.req.param("wineId"));
    if (wineId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await vintagesController.getByWineId(wineId);
    return c.json(data, 200);
  });

  vintage.openapi(crudRoutes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await vintagesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  vintage.openapi(crudRoutes.create, async (c) => {
    const body = c.req.valid("json") as CreateVintage;
    const data = await vintagesController.create(body);
    return c.json(data, 201);
  });

  vintage.openapi(crudRoutes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateVintage;
    const data = await vintagesController.update(id, body);
    return c.json(data, 200);
  });

  vintage.openapi(crudRoutes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await vintagesController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/vintage", vintage);
}
