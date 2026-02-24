import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as vintagesController from "@controllers/vintages.controller.js";
import {
  createVintageSchema,
  updateVintageSchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";

export function registerVintageRoutes(app: Hono) {
  const vintage = new Hono();

  vintage.use("*", requireAuth);

  vintage.get("/", async (c) => {
    const data = await vintagesController.list();
    return c.json(data);
  });

  vintage.get("/wine/:wineId", async (c) => {
    const wineId = parseId(c.req.param("wineId"));
    if (wineId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await vintagesController.getByWineId(wineId);
    return c.json(data);
  });

  vintage.get("/:id", async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await vintagesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data);
  });

  vintage.post("/", zValidator("json", createVintageSchema), async (c) => {
    const body = c.req.valid("json");
    const data = await vintagesController.create(body);
    return c.json(data, 201);
  });

  vintage.put("/:id", zValidator("json", updateVintageSchema), async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json");
    const data = await vintagesController.update(id, body);
    return c.json(data);
  });

  vintage.delete("/:id", async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await vintagesController.remove(id);
    return c.json({ success: true });
  });

  app.route("/vintage", vintage);
}
