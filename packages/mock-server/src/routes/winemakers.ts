import type { Hono } from "hono";
import type { MockState } from "../index";

let nextId = 1000;

export function registerWinemakerRoutes(app: Hono, state: MockState) {
  app.get("/api/winemaker", (c) => {
    return c.json(state.winemakers);
  });

  app.get("/api/winemaker/:id", (c) => {
    const id = Number(c.req.param("id"));
    const winemaker = state.winemakers.find((w) => w.id === id);
    if (!winemaker) return c.json({ error: "Not found" }, 404);
    return c.json(winemaker);
  });

  app.post("/api/winemaker", async (c) => {
    const body = await c.req.json();
    const winemaker = { id: ++nextId, ...body };
    state.winemakers.push(winemaker);
    return c.json(winemaker, 201);
  });

  app.put("/api/winemaker/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const idx = state.winemakers.findIndex((w) => w.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.winemakers[idx] = { ...state.winemakers[idx], ...body };
    return c.json(state.winemakers[idx]);
  });

  app.delete("/api/winemaker/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.winemakers.findIndex((w) => w.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.winemakers.splice(idx, 1);
    return c.json(true);
  });
}
