import type { Hono } from "hono";
import type { MockState } from "../index";
import {
  createWineMakerSchema,
  updateWineMakerSchema,
} from "@cellarboss/validators";

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
    const result = createWineMakerSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const winemaker = { id: ++nextId, ...result.data };
    state.winemakers.push(winemaker);
    return c.json(winemaker, 201);
  });

  app.put("/api/winemaker/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const result = updateWineMakerSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const idx = state.winemakers.findIndex((w) => w.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.winemakers[idx] = { ...state.winemakers[idx], ...result.data };
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
