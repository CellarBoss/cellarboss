import type { Hono } from "hono";
import type { MockState } from "../index";

export function registerWinegrapeRoutes(app: Hono, _state: MockState) {
  app.get("/api/winegrape", (c) => c.json([]));

  app.post("/api/winegrape", async (c) => {
    const body = await c.req.json();
    return c.json({ wineId: body.wineId, grapeId: body.grapeId }, 201);
  });

  app.delete("/api/winegrape/:wineId/:grapeId", (c) => {
    return c.json(true);
  });
}
