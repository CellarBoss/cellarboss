import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { UpdateSetting } from "@cellarboss/types";
import * as settingsController from "@controllers/settings.controller.js";
import { updateSettingSchema } from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { requireAdmin } from "@middleware/admin.middleware.js";
import { jsonContent } from "@openapi/helpers.js";
import { settingResponseSchema, errorSchema } from "@openapi/schemas.js";

const keyParamSchema = z.object({
  key: z.string().openapi({ description: "Setting key", example: "siteName" }),
});

const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Settings"],
  summary: "List all settings",
  responses: {
    200: jsonContent(settingResponseSchema.array(), "List of settings"),
  },
});

const getByKeyRoute = createRoute({
  method: "get",
  path: "/{key}",
  tags: ["Settings"],
  summary: "Get a setting by key",
  request: { params: keyParamSchema },
  responses: {
    200: jsonContent(settingResponseSchema, "The setting"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

const updateRoute = createRoute({
  method: "put",
  path: "/{key}",
  tags: ["Settings"],
  security: [{ cookieAuth: [] }],
  summary: "Update a setting (admin only)",
  request: {
    params: keyParamSchema,
    body: jsonContent(updateSettingSchema, "Setting value to update"),
  },
  responses: {
    200: jsonContent(settingResponseSchema, "The updated setting"),
    401: jsonContent(errorSchema, "Unauthorized"),
    403: jsonContent(errorSchema, "Forbidden - admin required"),
    422: jsonContent(errorSchema, "Validation error"),
  },
});

export function registerSettingsRoutes(app: OpenAPIHono) {
  const settings = new OpenAPIHono();

  settings.openapi(listRoute, async (c) => {
    const data = await settingsController.list();
    return c.json(data, 200);
  });

  settings.openapi(getByKeyRoute, async (c) => {
    const key = c.req.param("key");
    const data = await settingsController.getByKey(key);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  // Auth + admin middleware applied only to PUT via Hono's method handler
  settings.on("PUT", ["/:key"], requireAuth, requireAdmin);

  settings.openapi(updateRoute, async (c) => {
    const key = c.req.param("key");
    const body = c.req.valid("json") as UpdateSetting;
    const data = await settingsController.update(key, body);
    return c.json(data, 200);
  });

  app.route("/settings", settings);
}
