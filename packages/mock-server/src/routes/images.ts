import type { Hono } from "hono";
import type { MockState } from "../index";

// Minimal valid JFIF JPEG (SOI + APP0 + EOI) — enough for the content-type to be
// correct without failing, even if it doesn't render a visible image.
const MINIMAL_JPEG = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
]);

let nextId = 3000;

export function registerImageRoutes(app: Hono, state: MockState) {
  app.get("/api/image/vintage/:vintageId", (c) => {
    const vintageId = Number(c.req.param("vintageId"));
    return c.json(state.images.filter((img) => img.vintageId === vintageId));
  });

  // Upload must be registered before /:id routes to avoid "upload" matching as an id
  app.post("/api/image/upload", async (c) => {
    const formData = await c.req.formData();
    const vintageId = Number(formData.get("vintageId"));
    const file = formData.get("file") as File | null;
    if (!file || !vintageId) return c.json({ error: "Bad request" }, 400);
    const image = {
      id: ++nextId,
      vintageId,
      filename: `${nextId}.jpg`,
      size: file.size,
      isFavourite: false,
      createdBy: state.session?.user.id ?? "unknown",
      createdAt: new Date().toISOString(),
    };
    state.images.push(image);
    return c.json(image, 201);
  });

  app.get("/api/image/:id/file", (c) => {
    return new Response(MINIMAL_JPEG, {
      headers: { "content-type": "image/jpeg" },
    });
  });

  app.get("/api/image/:id/thumb", (c) => {
    return new Response(MINIMAL_JPEG, {
      headers: { "content-type": "image/jpeg" },
    });
  });

  app.delete("/api/image/:id", (c) => {
    const id = Number(c.req.param("id"));
    const idx = state.images.findIndex((img) => img.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.images.splice(idx, 1);
    return c.json({ success: true });
  });

  app.put("/api/image/:id/favourite", (c) => {
    const id = Number(c.req.param("id"));
    const img = state.images.find((i) => i.id === id);
    if (!img) return c.json({ error: "Not found" }, 404);
    state.images.forEach((i) => {
      if (i.vintageId === img.vintageId) i.isFavourite = false;
    });
    img.isFavourite = true;
    return c.json(img);
  });

  app.delete("/api/image/:id/favourite", (c) => {
    const id = Number(c.req.param("id"));
    const img = state.images.find((i) => i.id === id);
    if (!img) return c.json({ error: "Not found" }, 404);
    img.isFavourite = false;
    return c.json(img);
  });
}
