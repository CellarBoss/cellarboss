import type { Hono } from "hono";
import type { MockState } from "../index";

let nextId = 1000;

export function registerVintageRoutes(app: Hono, state: MockState) {
  app.get("/api/vintage", (c) => {
    return c.json(state.vintages);
  });

  app.get("/api/vintage/:id", (c) => {
    const id = Number(c.req.param("id"));
    const vintage = state.vintages.find((v) => v.id === id);
    if (!vintage) return c.json({ error: "Not found" }, 404);
    return c.json(vintage);
  });

  app.post("/api/vintage", async (c) => {
    const body = await c.req.json();
    const vintage = { id: ++nextId, ...body };
    state.vintages.push(vintage);
    return c.json(vintage, 201);
  });

  app.put("/api/vintage/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const idx = state.vintages.findIndex((v) => v.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.vintages[idx] = { ...state.vintages[idx], ...body };
    return c.json(state.vintages[idx]);
  });

  app.delete("/api/vintage/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.vintages.findIndex((v) => v.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.vintages.splice(idx, 1);
    return c.json(true);
  });
}
