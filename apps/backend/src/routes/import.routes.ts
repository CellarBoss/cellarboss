import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { ImportCommit } from "@cellarboss/types";
import {
  importCommitSchema,
  importPreviewSchema,
  WINE_TYPES,
} from "@cellarboss/validators";
import * as importController from "@controllers/import.controller.js";
import { requireAuth } from "@middleware/auth.middleware.js";
import { jsonContent } from "@openapi/helpers.js";
import { errorSchema } from "@openapi/schemas.js";

const TAG = "Import";
const security = [{ cookieAuth: [] }];

const field = <T extends z.ZodType>(value: T) =>
  z.object({
    value,
    source: z.enum([
      "api",
      "site",
      "json-ld",
      "microdata",
      "label-table",
      "open-graph",
      "heuristic",
    ]),
    confidence: z.number().min(0).max(1),
  });

const resolutionSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("matched"),
    id: z.number(),
    name: z.string(),
    score: z.number(),
  }),
  z.object({
    status: z.literal("suggested"),
    proposedName: z.string(),
    candidates: z.array(
      z.object({ id: z.number(), name: z.string(), score: z.number() }),
    ),
  }),
  z.object({ status: z.literal("new"), proposedName: z.string() }),
  z.object({ status: z.literal("absent") }),
]);

const previewResponseSchema = z
  .object({
    wine: z.object({
      sourceUrl: z.string(),
      importerId: z.string(),
      title: field(z.string()).optional(),
      name: field(z.string()).optional(),
      type: field(z.enum(WINE_TYPES)).optional(),
      winemaker: field(z.string()).optional(),
      country: field(z.string()).optional(),
      regions: field(z.array(z.string())).optional(),
      grapes: field(z.array(z.string())).optional(),
      vintage: z
        .object({
          year: field(z.number().nullable()).optional(),
          drinkFrom: field(z.number()).optional(),
          drinkUntil: field(z.number()).optional(),
        })
        .optional(),
      imageUrl: field(z.string()).optional(),
    }),
    resolution: z.object({
      winemaker: resolutionSchema,
      country: resolutionSchema,
      region: resolutionSchema,
      grapes: z.array(resolutionSchema),
    }),
    existing: z.object({
      wine: z.object({ id: z.number(), name: z.string() }).nullable(),
      vintage: z
        .object({ id: z.number(), year: z.number().nullable() })
        .nullable(),
    }),
  })
  .openapi("ImportPreview");

const sitesRoute = createRoute({
  method: "get",
  path: "/sites",
  tags: [TAG],
  security,
  summary: "List sites with a dedicated importer",
  responses: {
    200: jsonContent(
      z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          hosts: z.array(z.string()),
        }),
      ),
      "Supported sites. Other sites are still read with generic extraction.",
    ),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

const previewRoute = createRoute({
  method: "post",
  path: "/preview",
  tags: [TAG],
  security,
  summary: "Read wine details from a page and match them to existing records",
  description:
    "Writes nothing. Every failure returns the same IMPORT_FAILED error; the reason is logged on the server.",
  request: { body: jsonContent(importPreviewSchema, "The page to import") },
  responses: {
    200: jsonContent(previewResponseSchema, "Details and matches"),
    400: jsonContent(errorSchema, "Validation error"),
    401: jsonContent(errorSchema, "Unauthorized"),
    422: jsonContent(errorSchema, "IMPORT_FAILED"),
  },
});

const commitRoute = createRoute({
  method: "post",
  path: "/commit",
  tags: [TAG],
  security,
  summary: "Create the wine and vintage from an import",
  description:
    "Creates any new winemaker, country, region and grapes, then the wine and vintage, in one transaction. If the vintage already exists nothing is created.",
  request: { body: jsonContent(importCommitSchema, "The reviewed import") },
  responses: {
    200: jsonContent(
      z.object({
        wineId: z.number(),
        vintageId: z.number(),
        created: z.boolean(),
      }),
      "The wine and vintage",
    ),
    400: jsonContent(errorSchema, "Validation error"),
    401: jsonContent(errorSchema, "Unauthorized"),
    404: jsonContent(errorSchema, "A referenced record does not exist"),
  },
});

type AuthUser = { id: string };

export function registerImportRoutes(app: OpenAPIHono) {
  const importApp = new OpenAPIHono();

  importApp.use("*", requireAuth);

  importApp.openapi(sitesRoute, (c) => {
    return c.json(importController.sites(), 200);
  });

  importApp.openapi(previewRoute, async (c) => {
    const user = c.get("user" as never) as AuthUser;
    const body = c.req.valid("json") as z.infer<typeof importPreviewSchema>;
    const result = await importController.preview(body, user.id);
    if (!result.ok) return c.json({ error: "IMPORT_FAILED" }, 422);
    return c.json(result.preview, 200);
  });

  importApp.openapi(commitRoute, async (c) => {
    const body = c.req.valid("json") as ImportCommit;
    try {
      const result = await importController.commit(body);
      return c.json(result, 200);
    } catch (e) {
      if (e instanceof importController.ImportCommitError) {
        return c.json({ error: e.message }, e.status);
      }
      throw e;
    }
  });

  app.route("/import", importApp);
}
