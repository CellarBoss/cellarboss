import type { Hono } from "hono";
import type { MockState } from "../index";
import {
  createLocationSchema,
  updateLocationSchema,
} from "@cellarboss/validators";

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
    const result = createLocationSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const location = { id: ++nextId, ...result.data };
    state.locations.push(location);
    return c.json(location, 201);
  });

  app.put("/api/location/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const result = updateLocationSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const idx = state.locations.findIndex((l) => l.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.locations[idx] = { ...state.locations[idx], ...result.data };
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
