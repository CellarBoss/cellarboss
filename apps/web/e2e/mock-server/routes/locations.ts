import type { Hono } from "hono";
import type { MockState } from "../index";

let nextId = 1000;

export function registerLocationRoutes(app: Hono, state: MockState) {
  app.get("/api/location", (c) => c.json(state.locations));

  app.get("/api/location/:id", (c) => {
    const id = Number(c.req.param("id"));
    const location = state.locations.find((l) => l.id === id);
    if (!location) return c.json({ error: "Not found" }, 404);
    return c.json(location);
  });

  app.post("/api/location", async (c) => {
    const body = await c.req.json();
    const location = { id: ++nextId, ...body };
    state.locations.push(location);
    return c.json(location, 201);
  });

  app.put("/api/location/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const idx = state.locations.findIndex((l) => l.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.locations[idx] = { ...state.locations[idx], ...body };
    return c.json(state.locations[idx]);
  });

  app.delete("/api/location/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.locations.findIndex((l) => l.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.locations.splice(idx, 1);
    return c.json(true);
  });
}
