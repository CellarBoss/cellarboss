import type { Hono } from "hono";
import type { MockState } from "../index";
import { createBottleSchema, updateBottleSchema } from "@cellarboss/validators";

let nextId = 1000;

export function registerBottleRoutes(app: Hono, state: MockState) {
  app.get("/api/bottle", (c) => {
    return c.json(state.bottles);
  });

  app.get("/api/bottle/vintage/:vintageId/counts", (c) => {
    const vintageId = Number(c.req.param("vintageId"));
    const bottles = state.bottles.filter((b) => b.vintageId === vintageId);
    const counts = new Map<string, number>();
    for (const b of bottles) {
      counts.set(b.status, (counts.get(b.status) || 0) + 1);
    }
    return c.json(
      Array.from(counts.entries()).map(([status, count]) => ({
        status,
        count,
      })),
    );
  });

  app.get("/api/bottle/:id", (c) => {
    const id = Number(c.req.param("id"));
    const bottle = state.bottles.find((b) => b.id === id);
    if (!bottle) return c.json({ error: "Not found" }, 404);
    return c.json(bottle);
  });

  app.post("/api/bottle", async (c) => {
    const body = await c.req.json();
    const result = createBottleSchema.safeParse(body);
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400);
    }
    const bottle = { id: ++nextId, ...result.data };
    state.bottles.push(bottle);
    return c.json(bottle, 201);
  });

  app.put("/api/bottle/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const result = updateBottleSchema.safeParse(body);
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400);
    }
    const idx = state.bottles.findIndex((b) => b.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.bottles[idx] = { ...state.bottles[idx], ...result.data };
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
