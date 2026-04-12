import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
  cleanDatabase,
} from "./setup";
import { registerGrapeRoutes } from "@routes/grapes.routes.js";
import { db } from "@utils/database.js";

describe("Grape API", () => {
  beforeAll(async () => {
    await runMigrations(db);
    await cleanDatabase(db);
  });
  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerGrapeRoutes(app);
    });

    it("GET /grape returns 401", async () => {
      const res = await app.request("/grape");
      expect(res.status).toBe(401);
    });

    it("POST /grape returns 401", async () => {
      const res = await app.request("/grape", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /grape/:id returns 401", async () => {
      const res = await app.request("/grape/1");
      expect(res.status).toBe(401);
    });

    it("PUT /grape/:id returns 401", async () => {
      const res = await app.request("/grape/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /grape/:id returns 401", async () => {
      const res = await app.request("/grape/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestAppWithAuth();
      registerGrapeRoutes(app);
    });

    describe("GET /grape", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/grape");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe("POST /grape", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/grape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a grape with valid data", async () => {
        const res = await app.request("/grape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Cabernet Sauvignon" }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.name).toBe("Cabernet Sauvignon");
      });
    });

    describe("GET /grape/:id", () => {
      it("returns 404 for non-existent grape", async () => {
        const res = await app.request("/grape/999");
        expect(res.status).toBe(404);
      });

      it("returns grape by id", async () => {
        const createRes = await app.request("/grape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Merlot" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/grape/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.name).toBe("Merlot");
      });
    });

    describe("invalid ID handling", () => {
      it("GET /grape/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/grape/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("PUT /grape/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/grape/abc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test" }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("DELETE /grape/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/grape/abc", { method: "DELETE" });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });
    });

    describe("PUT /grape/:id", () => {
      it("updates a grape", async () => {
        const createRes = await app.request("/grape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Pinot Noir" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/grape/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Pinot Noir (Updated)" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.name).toBe("Pinot Noir (Updated)");
      });
    });

    describe("DELETE /grape/:id", () => {
      it("deletes a grape", async () => {
        const createRes = await app.request("/grape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Chardonnay" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/grape/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });
    });
  });
});
