import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  upsertUserPreferenceSchema,
  userPreferenceKeySchema,
} from "@cellarboss/validators";
import * as preferencesController from "@controllers/user-preferences.controller.js";
import { requireAuth } from "@middleware/auth.middleware.js";
import { jsonContent } from "@openapi/helpers.js";
import {
  errorSchema,
  successSchema,
  userPreferenceResponseSchema,
  userPreferenceUpsertRequestSchema,
} from "@openapi/schemas.js";

const keyParamSchema = z.object({
  key: userPreferenceKeySchema.openapi({
    description: "User preference key",
    example: "datatable.wines.columnVisibility",
  }),
});

const getRoute = createRoute({
  method: "get",
  path: "/{key}",
  tags: ["Preferences"],
  security: [{ cookieAuth: [] }],
  summary: "Get a user preference",
  request: { params: keyParamSchema },
  responses: {
    200: jsonContent(userPreferenceResponseSchema, "The user preference"),
    400: jsonContent(errorSchema, "Bad Request"),
    401: jsonContent(errorSchema, "Unauthorized"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

const upsertRoute = createRoute({
  method: "put",
  path: "/{key}",
  tags: ["Preferences"],
  security: [{ cookieAuth: [] }],
  summary: "Create or update a user preference",
  request: {
    params: keyParamSchema,
    body: jsonContent(userPreferenceUpsertRequestSchema, "Preference value"),
  },
  responses: {
    200: jsonContent(userPreferenceResponseSchema, "The saved preference"),
    400: jsonContent(errorSchema, "Bad Request"),
    401: jsonContent(errorSchema, "Unauthorized"),
    422: jsonContent(errorSchema, "Validation error"),
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/{key}",
  tags: ["Preferences"],
  security: [{ cookieAuth: [] }],
  summary: "Delete a user preference",
  request: { params: keyParamSchema },
  responses: {
    200: jsonContent(successSchema, "Preference deleted"),
    400: jsonContent(errorSchema, "Bad Request"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

export function registerUserPreferenceRoutes(app: OpenAPIHono) {
  const preferences = new OpenAPIHono();

  preferences.use("*", requireAuth);

  preferences.openapi(getRoute, async (c) => {
    const user = c.get("user" as never) as { id: string };
    const key = c.req.param("key");
    const data = await preferencesController.getByKey(user.id, key);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  preferences.openapi(upsertRoute, async (c) => {
    const user = c.get("user" as never) as { id: string };
    const key = c.req.param("key");
    // zod-to-openapi cannot render the recursive JSON validator, so the route
    // uses a finite docs schema and validates against the shared schema here.
    const body = upsertUserPreferenceSchema.safeParse(c.req.valid("json"));
    if (!body.success) return c.json({ error: "Validation error" }, 422);

    const data = await preferencesController.upsert(
      user.id,
      key,
      body.data.value,
    );
    return c.json(data, 200);
  });

  preferences.openapi(deleteRoute, async (c) => {
    const user = c.get("user" as never) as { id: string };
    const key = c.req.param("key");
    await preferencesController.remove(user.id, key);
    return c.json({ success: true }, 200);
  });

  app.route("/preferences", preferences);
}
