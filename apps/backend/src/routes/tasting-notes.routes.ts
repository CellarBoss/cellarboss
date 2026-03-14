import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { CreateTastingNote, UpdateTastingNote } from "@cellarboss/types";
import * as tastingNotesController from "@controllers/tasting-notes.controller.js";
import {
  createTastingNoteSchema,
  updateTastingNoteSchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes, jsonContent } from "@openapi/helpers.js";
import { tastingNoteResponseSchema, errorSchema } from "@openapi/schemas.js";

const crudRoutes = createCrudRoutes({
  tag: "Tasting Notes",
  resourceName: "tasting note",
  createSchema: createTastingNoteSchema,
  updateSchema: updateTastingNoteSchema,
  responseSchema: tastingNoteResponseSchema,
});

const vintageIdParamSchema = z.object({
  vintageId: z.string().openapi({ description: "Vintage ID", example: "1" }),
});

const wineIdParamSchema = z.object({
  wineId: z.string().openapi({ description: "Wine ID", example: "1" }),
});

const getByVintageRoute = createRoute({
  method: "get",
  path: "/vintage/{vintageId}",
  tags: ["Tasting Notes"],
  security: [{ cookieAuth: [] }],
  summary: "Get tasting notes by vintage ID",
  request: { params: vintageIdParamSchema },
  responses: {
    200: jsonContent(
      tastingNoteResponseSchema.array(),
      "List of tasting notes for the vintage",
    ),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

const getByWineRoute = createRoute({
  method: "get",
  path: "/wine/{wineId}",
  tags: ["Tasting Notes"],
  security: [{ cookieAuth: [] }],
  summary: "Get tasting notes by wine ID",
  request: { params: wineIdParamSchema },
  responses: {
    200: jsonContent(
      tastingNoteResponseSchema.array(),
      "List of tasting notes for the wine",
    ),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

export function registerTastingNoteRoutes(app: OpenAPIHono) {
  const tastingNote = new OpenAPIHono();

  tastingNote.use("*", requireAuth);

  tastingNote.openapi(crudRoutes.list, async (c) => {
    const data = await tastingNotesController.list();
    return c.json(data, 200);
  });

  tastingNote.openapi(getByVintageRoute, async (c) => {
    const vintageId = parseId(c.req.param("vintageId"));
    if (vintageId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await tastingNotesController.getByVintageId(vintageId);
    return c.json(data, 200);
  });

  tastingNote.openapi(getByWineRoute, async (c) => {
    const wineId = parseId(c.req.param("wineId"));
    if (wineId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await tastingNotesController.getByWineId(wineId);
    return c.json(data, 200);
  });

  tastingNote.openapi(crudRoutes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await tastingNotesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  tastingNote.openapi(crudRoutes.create, async (c) => {
    const body = c.req.valid("json") as CreateTastingNote;
    const user = c.get("user" as never) as {
      id: string;
      name: string;
      email: string;
    };
    const data = await tastingNotesController.create({
      ...body,
      authorId: user.id,
      date: new Date().toISOString(),
    });
    return c.json(data, 201);
  });

  tastingNote.openapi(crudRoutes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateTastingNote;
    const data = await tastingNotesController.update(id, body);
    return c.json(data, 200);
  });

  tastingNote.openapi(crudRoutes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await tastingNotesController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/tasting-note", tastingNote);
}
