import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as tastingNotesController from "@controllers/tasting-notes.controller.js";
import {
  createTastingNoteSchema,
  updateTastingNoteSchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";

export function registerTastingNoteRoutes(app: Hono) {
  const tastingNote = new Hono();

  tastingNote.use("*", requireAuth);

  tastingNote.get("/", async (c) => {
    const data = await tastingNotesController.list();
    return c.json(data);
  });

  tastingNote.get("/vintage/:vintageId", async (c) => {
    const vintageId = parseId(c.req.param("vintageId"));
    if (vintageId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await tastingNotesController.getByVintageId(vintageId);
    return c.json(data);
  });

  tastingNote.get("/wine/:wineId", async (c) => {
    const wineId = parseId(c.req.param("wineId"));
    if (wineId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await tastingNotesController.getByWineId(wineId);
    return c.json(data);
  });

  tastingNote.get("/:id", async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await tastingNotesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data);
  });

  tastingNote.post(
    "/",
    zValidator("json", createTastingNoteSchema),
    async (c) => {
      const body = c.req.valid("json");
      const user = c.get("user");
      const data = await tastingNotesController.create({
        ...body,
        author: user.name || user.email,
        date: new Date().toISOString(),
      });
      return c.json(data, 201);
    },
  );

  tastingNote.put(
    "/:id",
    zValidator("json", updateTastingNoteSchema),
    async (c) => {
      const id = parseId(c.req.param("id"));
      if (id === null) return c.json({ error: "Invalid ID" }, 400);
      const body = c.req.valid("json");
      const data = await tastingNotesController.update(id, body);
      return c.json(data);
    },
  );

  tastingNote.delete("/:id", async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await tastingNotesController.remove(id);
    return c.json({ success: true });
  });

  app.route("/tasting-note", tastingNote);
}
