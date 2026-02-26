import type { Hono } from "hono";
import type { MockState } from "../index";

let nextId = 1000;

export function registerStorageRoutes(app: Hono, state: MockState) {
  app.get("/api/storage", (c) => c.json(state.storages));

  app.get("/api/storage/:id", (c) => {
    const id = Number(c.req.param("id"));
    const storage = state.storages.find((s) => s.id === id);
    if (!storage) return c.json({ error: "Not found" }, 404);
    return c.json(storage);
  });

  app.post("/api/storage", async (c) => {
    const body = await c.req.json();
    const storage = { id: ++nextId, ...body };
    state.storages.push(storage);
    return c.json(storage, 201);
  });

  app.put("/api/storage/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const idx = state.storages.findIndex((s) => s.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.storages[idx] = { ...state.storages[idx], ...body };
    return c.json(state.storages[idx]);
  });

  app.delete("/api/storage/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.storages.findIndex((s) => s.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.storages.splice(idx, 1);
    return c.json(true);
  });
}
