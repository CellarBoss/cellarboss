import type { Hono } from "hono";
import type { MockState } from "../index";
import { createWineSchema, updateWineSchema } from "@cellarboss/validators";

let nextId = 1000;

export function registerWineRoutes(app: Hono, state: MockState) {
  app.get("/api/wine", (c) => {
    return c.json(state.wines);
  });

  app.get("/api/wine/:id", (c) => {
    const id = Number(c.req.param("id"));
    const wine = state.wines.find((w) => w.id === id);
    if (!wine) return c.json({ error: "Not found" }, 404);
    return c.json(wine);
  });

  app.post("/api/wine", async (c) => {
    const body = await c.req.json();
    const result = createWineSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const wine = { id: ++nextId, ...result.data };
    state.wines.push(wine);
    return c.json(wine, 201);
  });

  app.put("/api/wine/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const result = updateWineSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const idx = state.wines.findIndex((w) => w.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.wines[idx] = { ...state.wines[idx], ...result.data };
    return c.json(state.wines[idx]);
  });

  app.delete("/api/wine/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.wines.findIndex((w) => w.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.wines.splice(idx, 1);
    return c.json(true);
  });
}
