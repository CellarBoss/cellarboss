import type { Hono } from "hono";
import type { MockState } from "../index";

let nextId = 1000;

export function registerRegionRoutes(app: Hono, state: MockState) {
  app.get("/api/region", (c) => c.json(state.regions));

  app.get("/api/region/:id", (c) => {
    const id = Number(c.req.param("id"));
    const region = state.regions.find((r) => r.id === id);
    if (!region) return c.json({ error: "Not found" }, 404);
    return c.json(region);
  });

  app.post("/api/region", async (c) => {
    const body = await c.req.json();
    const region = { id: ++nextId, ...body };
    state.regions.push(region);
    return c.json(region, 201);
  });

  app.put("/api/region/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const idx = state.regions.findIndex((r) => r.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.regions[idx] = { ...state.regions[idx], ...body };
    return c.json(state.regions[idx]);
  });

  app.delete("/api/region/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.regions.findIndex((r) => r.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.regions.splice(idx, 1);
    return c.json(true);
  });
}
