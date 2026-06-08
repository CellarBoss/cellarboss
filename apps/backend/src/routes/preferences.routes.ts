import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { UpsertPreference } from "@cellarboss/types";
import * as preferencesController from "@controllers/preferences.controller.js";
import {
  upsertPreferenceSchema,
  preferenceKeySchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { jsonContent } from "@openapi/helpers.js";
import {
  preferenceResponseSchema,
  errorSchema,
  successSchema,
} from "@openapi/schemas.js";

const keyParamSchema = z.object({
  key: preferenceKeySchema.openapi({
    description: "Preference key (lowercase dotted identifiers)",
    example: "columns.bottles",
  }),
});

const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Preferences"],
  security: [{ cookieAuth: [] }],
  summary: "List all preferences for the authenticated user",
  responses: {
    200: jsonContent(preferenceResponseSchema.array(), "List of preferences"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

const getByKeyRoute = createRoute({
  method: "get",
  path: "/{key}",
  tags: ["Preferences"],
  security: [{ cookieAuth: [] }],
  summary: "Get a preference by key for the authenticated user",
  request: { params: keyParamSchema },
  responses: {
    200: jsonContent(preferenceResponseSchema, "The preference"),
    401: jsonContent(errorSchema, "Unauthorized"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

const upsertRoute = createRoute({
  method: "put",
  path: "/{key}",
  tags: ["Preferences"],
  security: [{ cookieAuth: [] }],
  summary: "Create or update a preference for the authenticated user",
  request: {
    params: keyParamSchema,
    body: jsonContent(upsertPreferenceSchema, "Preference value to set"),
  },
  responses: {
    200: jsonContent(preferenceResponseSchema, "The saved preference"),
    401: jsonContent(errorSchema, "Unauthorized"),
    422: jsonContent(errorSchema, "Validation error"),
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/{key}",
  tags: ["Preferences"],
  security: [{ cookieAuth: [] }],
  summary: "Delete a preference for the authenticated user",
  request: { params: keyParamSchema },
  responses: {
    200: jsonContent(successSchema, "Successfully deleted"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

type AuthUser = { id: string; name: string; email: string };

export function registerPreferenceRoutes(app: OpenAPIHono) {
  const preferences = new OpenAPIHono();

  preferences.use("*", requireAuth);

  preferences.openapi(listRoute, async (c) => {
    const user = c.get("user" as never) as AuthUser;
    const data = await preferencesController.listForUser(user.id);
    return c.json(data, 200);
  });

  preferences.openapi(getByKeyRoute, async (c) => {
    const user = c.get("user" as never) as AuthUser;
    const key = c.req.param("key");
    const data = await preferencesController.getByKey(user.id, key);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  preferences.openapi(upsertRoute, async (c) => {
    const user = c.get("user" as never) as AuthUser;
    const key = c.req.param("key");
    const body = c.req.valid("json") as UpsertPreference;
    const data = await preferencesController.upsert(user.id, key, body);
    return c.json(data, 200);
  });

  preferences.openapi(deleteRoute, async (c) => {
    const user = c.get("user" as never) as AuthUser;
    const key = c.req.param("key");
    await preferencesController.remove(user.id, key);
    return c.json({ success: true }, 200);
  });

  app.route("/user/preferences", preferences);
}
