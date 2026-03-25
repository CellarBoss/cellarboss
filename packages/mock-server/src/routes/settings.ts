import type { Hono } from "hono";
import type { MockState } from "../index";
import { updateSettingSchema } from "@cellarboss/validators";

export function registerSettingsRoutes(app: Hono, state: MockState) {
  app.get("/api/settings", (c) => c.json(state.settings));

  app.get("/api/settings/:key", (c) => {
    const key = decodeURIComponent(c.req.param("key"));
    const setting = state.settings.find((s) => s.key === key);
    if (!setting) return c.json({ error: "Not found" }, 404);
    return c.json(setting);
  });

  app.put("/api/settings/:key", async (c) => {
    const key = decodeURIComponent(c.req.param("key"));
    const body = await c.req.json();
    const result = updateSettingSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const idx = state.settings.findIndex((s) => s.key === key);
    if (idx === -1) {
      state.settings.push({ key, value: result.data.value });
    } else {
      state.settings[idx] = { key, value: result.data.value };
    }
    return c.json({ key, value: result.data.value });
  });
}
