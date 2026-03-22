import type { Hono } from "hono";
import type { MockState } from "../index";

let nextId = 1000;

export function registerGrapeRoutes(app: Hono, state: MockState) {
  app.get("/api/grape", (c) => c.json(state.grapes));

  app.get("/api/grape/:id", (c) => {
    const id = Number(c.req.param("id"));
    const grape = state.grapes.find((g) => g.id === id);
    if (!grape) return c.json({ error: "Not found" }, 404);
    return c.json(grape);
  });

  app.post("/api/grape", async (c) => {
    const body = await c.req.json();
    const grape = { id: ++nextId, ...body };
    state.grapes.push(grape);
    return c.json(grape, 201);
  });

  app.put("/api/grape/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const idx = state.grapes.findIndex((g) => g.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.grapes[idx] = { ...state.grapes[idx], ...body };
    return c.json(state.grapes[idx]);
  });

  app.delete("/api/grape/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.grapes.findIndex((g) => g.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.grapes.splice(idx, 1);
    return c.json(true);
  });
}
