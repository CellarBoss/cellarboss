import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
  cleanDatabase,
} from "./setup";
import { registerWineMakerRoutes } from "@routes/winemakers.routes.js";
import { db } from "@utils/database.js";

describe("WineMaker API", () => {
  beforeAll(async () => {
    await runMigrations(db);
    await cleanDatabase(db);
  });
  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerWineMakerRoutes(app);
    });

    it("GET /winemaker returns 401", async () => {
      const res = await app.request("/winemaker");
      expect(res.status).toBe(401);
    });

    it("POST /winemaker returns 401", async () => {
      const res = await app.request("/winemaker", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /winemaker/:id returns 401", async () => {
      const res = await app.request("/winemaker/1");
      expect(res.status).toBe(401);
    });

    it("PUT /winemaker/:id returns 401", async () => {
      const res = await app.request("/winemaker/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /winemaker/:id returns 401", async () => {
      const res = await app.request("/winemaker/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestAppWithAuth();
      registerWineMakerRoutes(app);
    });

    describe("GET /winemaker", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/winemaker");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe("POST /winemaker", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/winemaker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a winemaker with valid data", async () => {
        const res = await app.request("/winemaker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Château Lafite Rothschild" }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.name).toBe("Château Lafite Rothschild");
      });
    });

    describe("GET /winemaker/:id", () => {
      it("returns 404 for non-existent winemaker", async () => {
        const res = await app.request("/winemaker/999");
        expect(res.status).toBe(404);
      });

      it("returns winemaker by id", async () => {
        const createRes = await app.request("/winemaker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Domaine de la Romanée-Conti" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/winemaker/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.name).toBe("Domaine de la Romanée-Conti");
      });
    });

    describe("invalid ID handling", () => {
      it("GET /winemaker/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/winemaker/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("PUT /winemaker/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/winemaker/abc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test" }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("DELETE /winemaker/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/winemaker/abc", { method: "DELETE" });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });
    });

    describe("PUT /winemaker/:id", () => {
      it("updates a winemaker", async () => {
        const createRes = await app.request("/winemaker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Penfolds" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/winemaker/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Penfolds Wines" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.name).toBe("Penfolds Wines");
      });
    });

    describe("DELETE /winemaker/:id", () => {
      it("deletes a winemaker", async () => {
        const createRes = await app.request("/winemaker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Screaming Eagle" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/winemaker/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });
    });
  });
});
