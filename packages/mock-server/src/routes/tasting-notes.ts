import type { Hono } from "hono";
import type { MockState } from "../index";
import {
  createTastingNoteSchema,
  updateTastingNoteSchema,
} from "@cellarboss/validators";

let nextId = 1000;

export function registerTastingNoteRoutes(app: Hono, state: MockState) {
  app.get("/api/tasting-note", (c) => {
    return c.json(state.tastingNotes);
  });

  app.get("/api/tasting-note/vintage/:vintageId", (c) => {
    const vintageId = Number(c.req.param("vintageId"));
    const notes = state.tastingNotes.filter((n) => n.vintageId === vintageId);
    return c.json(notes);
  });

  app.get("/api/tasting-note/wine/:wineId", (c) => {
    const wineId = Number(c.req.param("wineId"));
    const vintageIds = new Set(
      state.vintages.filter((v) => v.wineId === wineId).map((v) => v.id),
    );
    const notes = state.tastingNotes.filter((n) => vintageIds.has(n.vintageId));
    return c.json(notes);
  });

  app.get("/api/tasting-note/:id", (c) => {
    const id = Number(c.req.param("id"));
    const note = state.tastingNotes.find((n) => n.id === id);
    if (!note) return c.json({ error: "Not found" }, 404);
    return c.json(note);
  });

  app.post("/api/tasting-note", async (c) => {
    const body = await c.req.json();
    const result = createTastingNoteSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const note = {
      id: ++nextId,
      ...result.data,
      authorId: state.session?.user.id ?? "unknown",
      author: state.session?.user.name ?? "Unknown",
      date: new Date().toISOString(),
    };
    state.tastingNotes.push(note);
    return c.json(note, 201);
  });

  app.put("/api/tasting-note/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const result = updateTastingNoteSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const idx = state.tastingNotes.findIndex((n) => n.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.tastingNotes[idx] = { ...state.tastingNotes[idx], ...result.data };
    return c.json(state.tastingNotes[idx]);
  });

  app.delete("/api/tasting-note/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.tastingNotes.findIndex((n) => n.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.tastingNotes.splice(idx, 1);
    return c.json(true);
  });
}
