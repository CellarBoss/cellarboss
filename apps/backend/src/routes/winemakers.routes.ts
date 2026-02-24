import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as winemakersController from "@controllers/winemakers.controller.js";
import {
  createWineMakerSchema,
  updateWineMakerSchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";

export function registerWineMakerRoutes(app: Hono) {
  const winemaker = new Hono();

  winemaker.use("*", requireAuth);

  winemaker.get("/", async (c) => {
    const data = await winemakersController.list();
    return c.json(data);
  });

  winemaker.get("/:id", async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await winemakersController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data);
  });

  winemaker.post("/", zValidator("json", createWineMakerSchema), async (c) => {
    const body = c.req.valid("json");
    const data = await winemakersController.create(body);
    return c.json(data, 201);
  });

  winemaker.put(
    "/:id",
    zValidator("json", updateWineMakerSchema),
    async (c) => {
      const id = parseId(c.req.param("id"));
      if (id === null) return c.json({ error: "Invalid ID" }, 400);
      const body = c.req.valid("json");
      const data = await winemakersController.update(id, body);
      return c.json(data);
    },
  );

  winemaker.delete("/:id", async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await winemakersController.remove(id);
    return c.json({ success: true });
  });

  app.route("/winemaker", winemaker);
}
