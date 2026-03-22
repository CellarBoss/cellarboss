import type { Hono } from "hono";
import type { MockState } from "../index";

export function registerWinegrapeRoutes(app: Hono, state: MockState) {
  app.get("/api/winegrape", (c) => c.json(state.wineGrapes));

  app.get("/api/winegrape/wine/:wineId", (c) => {
    const wineId = Number(c.req.param("wineId"));
    const grapes = state.wineGrapes.filter((wg) => wg.wineId === wineId);
    return c.json(grapes);
  });

  app.post("/api/winegrape", async (c) => {
    const body = await c.req.json();
    const wineGrape = { wineId: body.wineId, grapeId: body.grapeId };
    state.wineGrapes.push(wineGrape);
    return c.json(wineGrape, 201);
  });

  app.delete("/api/winegrape/:wineId/:grapeId", (c) => {
    const wineId = Number(c.req.param("wineId"));
    const grapeId = Number(c.req.param("grapeId"));
    state.wineGrapes = state.wineGrapes.filter(
      (wg) => !(wg.wineId === wineId && wg.grapeId === grapeId),
    );
    return c.json(true);
  });
}
