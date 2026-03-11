import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import * as usersController from "@controllers/users.controller.js";
import { requireAuth } from "@middleware/auth.middleware.js";
import { requireAdmin } from "@middleware/admin.middleware.js";
import { jsonContent } from "@openapi/helpers.js";
import { userResponseSchema, errorSchema } from "@openapi/schemas.js";

const updateUserSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    email: z.email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

const userIdParamSchema = z.object({
  id: z.string().openapi({ description: "User ID", example: "abc123" }),
});

const getUserRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Users"],
  security: [{ cookieAuth: [] }],
  summary: "Get a user by ID (admin only)",
  request: { params: userIdParamSchema },
  responses: {
    200: jsonContent(userResponseSchema, "The user"),
    401: jsonContent(errorSchema, "Unauthorized"),
    403: jsonContent(errorSchema, "Forbidden - admin required"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

const updateUserRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Users"],
  security: [{ cookieAuth: [] }],
  summary: "Update a user (admin only)",
  request: {
    params: userIdParamSchema,
    body: jsonContent(updateUserSchema, "Fields to update"),
  },
  responses: {
    200: jsonContent(userResponseSchema, "The updated user"),
    401: jsonContent(errorSchema, "Unauthorized"),
    403: jsonContent(errorSchema, "Forbidden - admin required"),
    422: jsonContent(errorSchema, "Validation error"),
  },
});

export function registerUserRoutes(app: OpenAPIHono) {
  const user = new OpenAPIHono();

  user.use("*", requireAuth, requireAdmin);

  user.openapi(getUserRoute, async (c) => {
    const id = c.req.param("id");
    const data = await usersController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  user.openapi(updateUserRoute, async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json") as { name?: string; email?: string };
    const data = await usersController.update(id, body);
    return c.json(data, 200);
  });

  app.route("/user", user);
}
