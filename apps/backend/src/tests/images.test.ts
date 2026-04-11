import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import sharp from "sharp";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
  cleanDatabase,
  createTestUser,
  createTestVintage,
  createTestWine,
  createTestWineMaker,
} from "./setup";
import { registerImageRoutes } from "@routes/images.routes.js";
import { db } from "@utils/database.js";

let testUploadDir: string;
let testJpegBuffer: Buffer;

beforeAll(async () => {
  // Set UPLOAD_DIR before any image route handler reads it
  testUploadDir = await fs.mkdtemp(path.join(os.tmpdir(), "cb-test-uploads-"));
  process.env.UPLOAD_DIR = testUploadDir;

  // Generate a valid 4x4 JPEG with sharp so we know it processes correctly
  testJpegBuffer = Buffer.from(
    await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 200, g: 100, b: 50 },
      },
    })
      .jpeg()
      .toBuffer(),
  );

  await runMigrations(db);
  await cleanDatabase(db);
  await createTestUser(db);
});

afterAll(async () => {
  await fs.rm(testUploadDir, { recursive: true, force: true });
  delete process.env.UPLOAD_DIR;
});

function makeFormData(mimeType = "image/jpeg", filename = "test.jpg") {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(testJpegBuffer)], { type: mimeType });
  formData.append("file", new File([blob], filename, { type: mimeType }));
  return formData;
}

describe("Image API", () => {
  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerImageRoutes(app);
    });

    it("POST /image returns 401", async () => {
      const res = await app.request("/image/upload", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /image/vintage/:id returns 401", async () => {
      const res = await app.request("/image/vintage/1");
      expect(res.status).toBe(401);
    });

    it("GET /image/:id/file returns 401", async () => {
      const res = await app.request("/image/1/file");
      expect(res.status).toBe(401);
    });

    it("GET /image/:id/thumb returns 401", async () => {
      const res = await app.request("/image/1/thumb");
      expect(res.status).toBe(401);
    });

    it("DELETE /image/:id returns 401", async () => {
      const res = await app.request("/image/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });

    it("PUT /image/:id/favourite returns 401", async () => {
      const res = await app.request("/image/1/favourite", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /image/:id/favourite returns 401", async () => {
      const res = await app.request("/image/1/favourite", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("authenticated operations", () => {
    let app: OpenAPIHono;
    let testVintageId: number;

    async function uploadImage() {
      const formData = makeFormData();
      formData.append("vintageId", String(testVintageId));
      const res = await app.request("/image/upload", {
        method: "POST",
        body: formData,
      });
      return (await res.json()) as { id: number; isFavourite: boolean };
    }

    beforeEach(async () => {
      const maker = await createTestWineMaker(db, "Image Test Winery");
      const wine = await createTestWine(db, maker.id, null, "Image Test Wine");
      const vintage = await createTestVintage(db, wine.id, 2021);
      testVintageId = vintage.id;

      app = createTestAppWithAuth();
      registerImageRoutes(app);
    });

    describe("GET /image/vintage/:vintageId", () => {
      it("returns empty array for vintage with no images", async () => {
        const res = await app.request(`/image/vintage/${testVintageId}`);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
      });

      it("returns 400 for non-numeric vintageId", async () => {
        const res = await app.request("/image/vintage/abc");
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe("Invalid ID");
      });
    });

    describe("POST /image", () => {
      it("uploads an image and returns 201 with record", async () => {
        const formData = makeFormData();
        formData.append("vintageId", String(testVintageId));

        const res = await app.request("/image/upload", {
          method: "POST",
          body: formData,
        });
        expect(res.status).toBe(201);

        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.vintageId).toBe(testVintageId);
        expect(data.filename).toMatch(/\.jpg$/);
        expect(data.createdBy).toBe("test-user-1");
        expect(data).toHaveProperty("createdAt");
        expect(data.isFavourite).toBe(false);
      });

      it("returns 400 when file field is missing", async () => {
        const formData = new FormData();
        formData.append("vintageId", String(testVintageId));

        const res = await app.request("/image/upload", {
          method: "POST",
          body: formData,
        });
        expect(res.status).toBe(400);
      });

      it("returns 400 when vintageId is missing or invalid", async () => {
        const formData = makeFormData();
        formData.append("vintageId", "notanumber");

        const res = await app.request("/image/upload", {
          method: "POST",
          body: formData,
        });
        expect(res.status).toBe(400);
      });

      it("returns 400 for unsupported MIME type", async () => {
        const formData = makeFormData("image/gif", "test.gif");
        formData.append("vintageId", String(testVintageId));

        const res = await app.request("/image/upload", {
          method: "POST",
          body: formData,
        });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/Unsupported file type/);
      });
    });

    describe("GET /image/:id/file and /thumb", () => {
      it("returns image binary with correct content-type after upload", async () => {
        const formData = makeFormData();
        formData.append("vintageId", String(testVintageId));
        const uploadRes = await app.request("/image/upload", {
          method: "POST",
          body: formData,
        });
        const { id } = (await uploadRes.json()) as { id: number };

        const fileRes = await app.request(`/image/${id}/file`);
        expect(fileRes.status).toBe(200);
        expect(fileRes.headers.get("content-type")).toBe("image/jpeg");

        const thumbRes = await app.request(`/image/${id}/thumb`);
        expect(thumbRes.status).toBe(200);
        expect(thumbRes.headers.get("content-type")).toBe("image/jpeg");
      });

      it("returns 404 for non-existent id", async () => {
        expect((await app.request("/image/999999/file")).status).toBe(404);
        expect((await app.request("/image/999999/thumb")).status).toBe(404);
      });
    });

    describe("DELETE /image/:id", () => {
      it("deletes the record, returns success, and subsequent fetch returns 404", async () => {
        const formData = makeFormData();
        formData.append("vintageId", String(testVintageId));
        const uploadRes2 = await app.request("/image/upload", {
          method: "POST",
          body: formData,
        });
        const { id } = (await uploadRes2.json()) as { id: number };

        const delRes = await app.request(`/image/${id}`, { method: "DELETE" });
        expect(delRes.status).toBe(200);
        expect(await delRes.json()).toEqual({ success: true });

        expect((await app.request(`/image/${id}/file`)).status).toBe(404);
      });

      it("returns 404 when deleting non-existent image", async () => {
        const res = await app.request("/image/999999", { method: "DELETE" });
        expect(res.status).toBe(404);
      });
    });

    describe("PUT /image/:id/favourite", () => {
      it("sets the image as favourite and returns isFavourite: true", async () => {
        const { id } = await uploadImage();

        const res = await app.request(`/image/${id}/favourite`, {
          method: "PUT",
        });
        expect(res.status).toBe(200);
        expect((await res.json()).isFavourite).toBe(true);
      });

      it("clears the previous favourite when a new one is set", async () => {
        const first = await uploadImage();
        const second = await uploadImage();

        await app.request(`/image/${first.id}/favourite`, { method: "PUT" });
        await app.request(`/image/${second.id}/favourite`, { method: "PUT" });

        const listRes = await app.request(`/image/vintage/${testVintageId}`);
        const images = (await listRes.json()) as {
          id: number;
          isFavourite: boolean;
        }[];

        expect(images.find((i) => i.id === first.id)?.isFavourite).toBe(false);
        expect(images.find((i) => i.id === second.id)?.isFavourite).toBe(true);
      });

      it("returns 404 for non-existent image", async () => {
        const res = await app.request("/image/999999/favourite", {
          method: "PUT",
        });
        expect(res.status).toBe(404);
      });

      it("returns 400 for invalid ID", async () => {
        const res = await app.request("/image/abc/favourite", {
          method: "PUT",
        });
        expect(res.status).toBe(400);
      });
    });

    describe("DELETE /image/:id/favourite", () => {
      it("removes favourite status and returns isFavourite: false", async () => {
        const { id } = await uploadImage();
        await app.request(`/image/${id}/favourite`, { method: "PUT" });

        const res = await app.request(`/image/${id}/favourite`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        expect((await res.json()).isFavourite).toBe(false);
      });

      it("is a no-op when image was not already a favourite", async () => {
        const { id } = await uploadImage();

        const res = await app.request(`/image/${id}/favourite`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        expect((await res.json()).isFavourite).toBe(false);
      });

      it("returns 404 for non-existent image", async () => {
        const res = await app.request("/image/999999/favourite", {
          method: "DELETE",
        });
        expect(res.status).toBe(404);
      });

      it("returns 400 for invalid ID", async () => {
        const res = await app.request("/image/abc/favourite", {
          method: "DELETE",
        });
        expect(res.status).toBe(400);
      });
    });

    describe("invalid ID handling", () => {
      it("GET /image/vintage/abc returns 400", async () => {
        const res = await app.request("/image/vintage/abc");
        expect(res.status).toBe(400);
      });

      it("DELETE /image/abc returns 400", async () => {
        const res = await app.request("/image/abc", { method: "DELETE" });
        expect(res.status).toBe(400);
      });
    });
  });
});
