import { OpenAPIHono } from "@hono/zod-openapi";
import type { CreateWineMaker, UpdateWineMaker } from "@cellarboss/types";
import * as winemakersController from "@controllers/winemakers.controller.js";
import {
  createWineMakerSchema,
  updateWineMakerSchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes } from "@openapi/helpers.js";
import { wineMakerResponseSchema } from "@openapi/schemas.js";

const routes = createCrudRoutes({
  tag: "Winemakers",
  resourceName: "winemaker",
  createSchema: createWineMakerSchema,
  updateSchema: updateWineMakerSchema,
  responseSchema: wineMakerResponseSchema,
});

export function registerWineMakerRoutes(app: OpenAPIHono) {
  const winemaker = new OpenAPIHono();

  winemaker.use("*", requireAuth);

  winemaker.openapi(routes.list, async (c) => {
    const data = await winemakersController.list();
    return c.json(data, 200);
  });

  winemaker.openapi(routes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await winemakersController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  winemaker.openapi(routes.create, async (c) => {
    const body = c.req.valid("json") as CreateWineMaker;
    const data = await winemakersController.create(body);
    return c.json(data, 201);
  });

  winemaker.openapi(routes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateWineMaker;
    const data = await winemakersController.update(id, body);
    return c.json(data, 200);
  });

  winemaker.openapi(routes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await winemakersController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/winemaker", winemaker);
}
