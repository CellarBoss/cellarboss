import type { Hono } from "hono";
import type { MockState } from "../index";
import {
  createVintageSchema,
  updateVintageSchema,
} from "@cellarboss/validators";

let nextId = 1000;

export function registerVintageRoutes(app: Hono, state: MockState) {
  app.get("/api/vintage", (c) => {
    return c.json(state.vintages);
  });

  app.get("/api/vintage/wine/:wineId", (c) => {
    const wineId = Number(c.req.param("wineId"));
    const vintages = state.vintages.filter((v) => v.wineId === wineId);
    return c.json(vintages);
  });

  app.get("/api/vintage/:id", (c) => {
    const id = Number(c.req.param("id"));
    const vintage = state.vintages.find((v) => v.id === id);
    if (!vintage) return c.json({ error: "Not found" }, 404);
    return c.json(vintage);
  });

  app.post("/api/vintage", async (c) => {
    const body = await c.req.json();
    const result = createVintageSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const vintage = { id: ++nextId, ...result.data };
    state.vintages.push(vintage);
    return c.json(vintage, 201);
  });

  app.put("/api/vintage/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const result = updateVintageSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const idx = state.vintages.findIndex((v) => v.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.vintages[idx] = { ...state.vintages[idx], ...result.data };
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
