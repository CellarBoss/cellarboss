import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "@openapi/helpers.js";

const version = process.env.APP_VERSION ?? "development";

const versionResponseSchema = z.object({
  version: z.string().describe("Server version"),
});

const getVersionRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Version"],
  summary: "Get server version",
  responses: {
    200: jsonContent(versionResponseSchema, "Server version"),
  },
});

export function registerVersionRoutes(app: OpenAPIHono) {
  const versionApp = new OpenAPIHono();

  versionApp.openapi(getVersionRoute, (c) => {
    return c.json({ version }, 200);
  });

  app.route("/version", versionApp);
}
