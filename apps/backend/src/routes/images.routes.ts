import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import * as imagesController from "@controllers/images.controller.js";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import {
  saveImage,
  getImagePath,
  getThumbPath,
  isAllowedMimeType,
  MAX_FILE_SIZE,
} from "@utils/upload.js";
import { jsonContent, authSecurity } from "@openapi/helpers.js";
import {
  imageResponseSchema,
  errorSchema,
  successSchema,
} from "@openapi/schemas.js";
import { promises as fs } from "fs";

const vintageIdParamSchema = z.object({
  vintageId: z.string().openapi({ description: "Vintage ID", example: "1" }),
});

const idParamSchema = z.object({
  id: z.string().openapi({ description: "Image ID", example: "1" }),
});

const listByVintageRoute = createRoute({
  method: "get",
  path: "/vintage/{vintageId}",
  tags: ["Images"],
  security: authSecurity,
  summary: "List images for a vintage",
  request: { params: vintageIdParamSchema },
  responses: {
    200: jsonContent(
      imageResponseSchema.array(),
      "List of images for the vintage",
    ),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

const uploadRoute = createRoute({
  method: "post",
  path: "/upload",
  tags: ["Images"],
  security: authSecurity,
  summary: "Upload an image for a vintage",
  responses: {
    201: jsonContent(imageResponseSchema, "The uploaded image record"),
    400: jsonContent(errorSchema, "Bad request"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});

const getFileRoute = createRoute({
  method: "get",
  path: "/{id}/file",
  tags: ["Images"],
  security: authSecurity,
  summary: "Serve the full-size image",
  request: { params: idParamSchema },
  responses: {
    200: { description: "Image binary" },
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

const getThumbRoute = createRoute({
  method: "get",
  path: "/{id}/thumb",
  tags: ["Images"],
  security: authSecurity,
  summary: "Serve the thumbnail image",
  request: { params: idParamSchema },
  responses: {
    200: { description: "Thumbnail binary" },
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Images"],
  security: authSecurity,
  summary: "Delete an image",
  request: { params: idParamSchema },
  responses: {
    200: jsonContent(successSchema, "Successfully deleted"),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

const setFavouriteRoute = createRoute({
  method: "put",
  path: "/{id}/favourite",
  tags: ["Images"],
  security: authSecurity,
  summary: "Set an image as the favourite for its vintage",
  request: { params: idParamSchema },
  responses: {
    200: jsonContent(imageResponseSchema, "The updated image record"),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

const unsetFavouriteRoute = createRoute({
  method: "delete",
  path: "/{id}/favourite",
  tags: ["Images"],
  security: authSecurity,
  summary: "Remove the favourite status from an image",
  request: { params: idParamSchema },
  responses: {
    200: jsonContent(imageResponseSchema, "The updated image record"),
    400: jsonContent(errorSchema, "Invalid ID"),
    401: jsonContent(errorSchema, "Unauthorized"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

export function registerImageRoutes(app: OpenAPIHono) {
  const image = new OpenAPIHono();

  image.use("*", requireAuth);

  image.openapi(listByVintageRoute, async (c) => {
    const vintageId = parseId(c.req.param("vintageId"));
    if (vintageId === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await imagesController.listByVintageId(vintageId);
    return c.json(data, 200);
  });

  image.openapi(uploadRoute, async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"];
    const vintageIdRaw = body["vintageId"];

    if (!(file instanceof File)) {
      return c.json({ error: "file field is required" }, 400);
    }

    const vintageId = parseId(String(vintageIdRaw ?? ""));
    if (vintageId === null) {
      return c.json({ error: "vintageId must be a positive integer" }, 400);
    }

    const mimeType = file.type || "application/octet-stream";
    if (!isAllowedMimeType(mimeType)) {
      return c.json(
        {
          error: `Unsupported file type: ${mimeType}. Allowed: jpeg, png, webp, heic`,
        },
        400,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: "File exceeds 10MB limit" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { filename, size } = await saveImage(buffer);

    const user = c.get("user" as never) as { id: string };

    const record = await imagesController.create({
      vintageId,
      filename,
      size,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });

    return c.json(record, 201);
  });

  image.openapi(getFileRoute, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);

    const record = await imagesController.getById(id);
    if (!record) return c.json({ error: "Not found" }, 404);

    const filePath = getImagePath(record.filename);
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      return c.json({ error: "Image file not found on disk" }, 404);
    }

    return new Response(new Uint8Array(fileBuffer), {
      headers: { "Content-Type": "image/jpeg" },
    });
  });

  image.openapi(getThumbRoute, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);

    const record = await imagesController.getById(id);
    if (!record) return c.json({ error: "Not found" }, 404);

    const thumbPath = getThumbPath(record.filename);
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(thumbPath);
    } catch {
      return c.json({ error: "Thumbnail not found on disk" }, 404);
    }

    return new Response(new Uint8Array(fileBuffer), {
      headers: { "Content-Type": "image/jpeg" },
    });
  });

  image.openapi(deleteRoute, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);

    const record = await imagesController.getById(id);
    if (!record) return c.json({ error: "Not found" }, 404);

    await imagesController.remove(id);
    return c.json({ success: true }, 200);
  });

  image.openapi(setFavouriteRoute, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);

    const record = await imagesController.getById(id);
    if (!record) return c.json({ error: "Not found" }, 404);

    const updated = await imagesController.setFavourite(id, record.vintageId);
    return c.json(updated, 200);
  });

  image.openapi(unsetFavouriteRoute, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);

    const record = await imagesController.getById(id);
    if (!record) return c.json({ error: "Not found" }, 404);

    const updated = await imagesController.unsetFavourite(id);
    return c.json(updated, 200);
  });

  app.route("/image", image);
}
