import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as settingsController from "@controllers/settings.controller.js";
import { updateSettingSchema } from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { requireAdmin } from "@middleware/admin.middleware.js";

export function registerSettingsRoutes(app: Hono) {
  const settings = new Hono();

  // GET /settings - get all settings (public)
  settings.get("/", async (c) => {
    const data = await settingsController.list();
    return c.json(data);
  });

  // GET /settings/:key - get a specific setting (public)
  settings.get("/:key", async (c) => {
    const key = c.req.param("key");
    const data = await settingsController.getByKey(key);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data);
  });

  // PUT /settings/:key - update a setting (admin only)
  settings.put(
    "/:key",
    requireAuth,
    requireAdmin,
    zValidator("json", updateSettingSchema),
    async (c) => {
      const key = c.req.param("key");
      const body = c.req.valid("json");
      const data = await settingsController.update(key, body);
      return c.json(data);
    },
  );

  app.route("/settings", settings);
}
