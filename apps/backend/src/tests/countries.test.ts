import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestApp,
  createTestAppWithAuth,
  runMigrations,
} from "./setup.js";
import { registerCountryRoutes } from "@routes/countries.routes.js";
import { db } from "@utils/database.js";

describe("Country API", () => {
  beforeAll(async () => {
    await runMigrations(db);
  });
  describe("without auth", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerCountryRoutes(app);
    });

    it("GET /country returns 401", async () => {
      const res = await app.request("/country");
      expect(res.status).toBe(401);
    });

    it("POST /country returns 401", async () => {
      const res = await app.request("/country", { method: "POST" });
      expect(res.status).toBe(401);
    });

    it("GET /country/:id returns 401", async () => {
      const res = await app.request("/country/1");
      expect(res.status).toBe(401);
    });

    it("PUT /country/:id returns 401", async () => {
      const res = await app.request("/country/1", { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /country/:id returns 401", async () => {
      const res = await app.request("/country/1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("Authenticated operations", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestAppWithAuth();
      registerCountryRoutes(app);
    });

    describe("GET /country", () => {
      it("returns 200 with empty array", async () => {
        const res = await app.request("/country");
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe("POST /country", () => {
      it("returns 400 with invalid data", async () => {
        const res = await app.request("/country", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invalid: "data" }),
        });
        expect(res.status).toBe(400);
      });

      it("creates a country with valid data", async () => {
        const res = await app.request("/country", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "France" }),
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data).toHaveProperty("id");
        expect(data.name).toBe("France");
      });
    });

    describe("GET /country/:id", () => {
      it("returns 404 for non-existent country", async () => {
        const res = await app.request("/country/999");
        expect(res.status).toBe(404);
      });

      it("returns country by id", async () => {
        const createRes = await app.request("/country", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Italy" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/country/${created.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.id).toBe(created.id);
        expect(data.name).toBe("Italy");
      });
    });

    describe("invalid ID handling", () => {
      it("GET /country/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/country/abc");
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("PUT /country/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/country/abc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test" }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });

      it("DELETE /country/:id returns 400 for non-numeric id", async () => {
        const res = await app.request("/country/abc", { method: "DELETE" });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid ID");
      });
    });

    describe("PUT /country/:id", () => {
      it("updates a country", async () => {
        const createRes = await app.request("/country", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Spain" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/country/${created.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "España" }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.name).toBe("España");
      });
    });

    describe("DELETE /country/:id", () => {
      it("deletes a country", async () => {
        const createRes = await app.request("/country", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Germany" }),
        });
        const created = await createRes.json();

        const res = await app.request(`/country/${created.id}`, {
          method: "DELETE",
        });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true });
      });
    });
  });
});
