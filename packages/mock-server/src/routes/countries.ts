import type { Hono } from "hono";
import type { MockState } from "../index";

let nextId = 1000;

export function registerCountryRoutes(app: Hono, state: MockState) {
  app.get("/api/country", (c) => c.json(state.countries));

  app.get("/api/country/:id", (c) => {
    const id = Number(c.req.param("id"));
    const country = state.countries.find((c2) => c2.id === id);
    if (!country) return c.json({ error: "Not found" }, 404);
    return c.json(country);
  });

  app.post("/api/country", async (c) => {
    const body = await c.req.json();
    const country = { id: ++nextId, ...body };
    state.countries.push(country);
    return c.json(country, 201);
  });

  app.put("/api/country/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const idx = state.countries.findIndex((c2) => c2.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.countries[idx] = { ...state.countries[idx], ...body };
    return c.json(state.countries[idx]);
  });

  app.delete("/api/country/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.countries.findIndex((c2) => c2.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.countries.splice(idx, 1);
    return c.json(true);
  });
}
