import type { Hono } from "hono";
import type { MockState } from "../index";

let nextId = 1000;

export function registerBottleRoutes(app: Hono, state: MockState) {
  app.get("/api/bottle", (c) => {
    return c.json(state.bottles);
  });

  app.get("/api/bottle/:id", (c) => {
    const id = Number(c.req.param("id"));
    const bottle = state.bottles.find((b) => b.id === id);
    if (!bottle) return c.json({ error: "Not found" }, 404);
    return c.json(bottle);
  });

  app.post("/api/bottle", async (c) => {
    const body = await c.req.json();
    const bottle = { id: ++nextId, ...body };
    state.bottles.push(bottle);
    return c.json(bottle, 201);
  });

  app.put("/api/bottle/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const idx = state.bottles.findIndex((b) => b.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.bottles[idx] = { ...state.bottles[idx], ...body };
    return c.json(state.bottles[idx]);
  });

  app.delete("/api/bottle/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.bottles.findIndex((b) => b.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.bottles.splice(idx, 1);
    return c.json(true);
  });
}
