import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createTestAppWithAuth,
  createTestApp,
  runMigrations,
  cleanDatabase,
  createTestUser,
} from "./setup";
import { registerImportRoutes } from "@routes/import.routes.js";
import * as importController from "@controllers/import.controller.js";
import { RemoteFetchError, SafeFetcher } from "@utils/fetch-remote.js";
import { db } from "@utils/database.js";
import { insertReturning } from "@utils/query-helpers.js";
import type { Fetcher } from "../import/index.js";

const USER_ID = "test-user-1";
const SAMPLES = join(__dirname, "../import/__tests__/samples");
const sample = (name: string) => readFileSync(join(SAMPLES, name), "utf8");
const PRODUCT_URL = "https://shop.example.com/wine/chateau-example-2015";

function post(app: OpenAPIHono, path: string, body: unknown) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function fetcherReturning(body: string): Fetcher & { calls: number } {
  const fetcher = {
    calls: 0,
    fetch: async ({ url }: { url: URL }) => {
      fetcher.calls++;
      return { url, contentType: "html" as const, body, via: "http" as const };
    },
  };
  return fetcher;
}

function fetcherFailing(error: Error): Fetcher {
  return {
    fetch: async () => {
      throw error;
    },
  };
}

async function seedMaker(name: string) {
  return insertReturning(db, "winemaker", { name });
}

describe("Import API", () => {
  beforeAll(async () => {
    await runMigrations(db);
  });

  beforeEach(async () => {
    await cleanDatabase(db);
    await createTestUser(db, USER_ID);
    importController.resetImportState();
    vi.restoreAllMocks();
  });

  describe("unauthenticated access", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestApp();
      registerImportRoutes(app);
    });

    it("GET /import/sites returns 401", async () => {
      expect((await app.request("/import/sites")).status).toBe(401);
    });

    it("POST /import/preview returns 401", async () => {
      const res = await post(app, "/import/preview", { url: PRODUCT_URL });
      expect(res.status).toBe(401);
    });

    it("POST /import/commit returns 401", async () => {
      const res = await post(app, "/import/commit", {});
      expect(res.status).toBe(401);
    });
  });

  describe("routes", () => {
    let app: OpenAPIHono;

    beforeEach(() => {
      app = createTestAppWithAuth(USER_ID);
      registerImportRoutes(app);
    });

    it("GET /import/sites lists dedicated importers", async () => {
      const res = await app.request("/import/sites");
      expect(res.status).toBe(200);
      expect(Array.isArray(await res.json())).toBe(true);
    });

    /** Answers the routes' page fetches with `body` instead of the network. */
    function servePage(body: string) {
      vi.spyOn(SafeFetcher.prototype, "fetch").mockImplementation(
        async ({ url }) => ({ url, contentType: "html", body, via: "http" }),
      );
    }

    it("POST /import/preview reads the page", async () => {
      servePage(sample("json-ld-product.html"));
      const res = await post(app, "/import/preview", { url: PRODUCT_URL });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.wine.name.value).toBe("Margaux");
      expect(data.wine.vintage.year.value).toBe(2015);
      expect(data.resolution.winemaker.status).toBe("new");
      expect(data.existing).toEqual({ wine: null, vintage: null });
    });

    it("POST /import/preview rejects non-http URLs", async () => {
      const res = await post(app, "/import/preview", {
        url: "file:///etc/passwd",
      });
      expect(res.status).toBe(400);
    });

    it("POST /import/preview returns IMPORT_FAILED when nothing is found", async () => {
      servePage("<html><body>Nothing here</body></html>");
      const res = await post(app, "/import/preview", { url: PRODUCT_URL });
      expect(res.status).toBe(422);
      expect(await res.json()).toEqual({ error: "IMPORT_FAILED" });
    });

    it("POST /import/commit creates the wine and vintage", async () => {
      const res = await post(app, "/import/commit", {
        wine: {
          name: "Margaux",
          type: "red",
          winemaker: { name: "Château Example" },
          country: { name: "France" },
          region: { name: "Margaux" },
          grapes: [{ name: "Cabernet Sauvignon" }, { name: "Merlot" }],
        },
        vintage: { year: 2015, drinkFrom: 2022, drinkUntil: 2040 },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.created).toBe(true);

      const wine = await db
        .selectFrom("wine")
        .selectAll()
        .where("id", "=", data.wineId)
        .executeTakeFirstOrThrow();
      expect(wine.name).toBe("Margaux");
      const grapes = await db
        .selectFrom("winegrape")
        .select("grapeId")
        .where("wineId", "=", data.wineId)
        .execute();
      expect(grapes).toHaveLength(2);
      const vintage = await db
        .selectFrom("vintage")
        .selectAll()
        .where("id", "=", data.vintageId)
        .executeTakeFirstOrThrow();
      expect(vintage).toMatchObject({
        year: 2015,
        drinkFrom: 2022,
        drinkUntil: 2040,
      });
    });

    it("POST /import/commit returns 404 for a missing record", async () => {
      const res = await post(app, "/import/commit", {
        wine: { id: 9999 },
        vintage: { year: 2015, drinkFrom: null, drinkUntil: null },
      });
      expect(res.status).toBe(404);
    });

    it("POST /import/commit returns 400 for a new region without a country", async () => {
      const res = await post(app, "/import/commit", {
        wine: {
          name: "Margaux",
          type: "red",
          winemaker: { name: "Château Example" },
          country: null,
          region: { name: "Margaux" },
          grapes: [],
        },
        vintage: { year: 2015, drinkFrom: null, drinkUntil: null },
      });
      expect(res.status).toBe(400);
    });
  });

  describe("preview", () => {
    it("fetches the page and caches it", async () => {
      const fetcher = fetcherReturning(sample("json-ld-product.html"));
      const first = await importController.preview(
        { url: PRODUCT_URL },
        USER_ID,
        fetcher,
      );
      const second = await importController.preview(
        { url: PRODUCT_URL },
        USER_ID,
        fetcher,
      );
      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);
      expect(fetcher.calls).toBe(1);
    });

    it("reports the fetch failure reason", async () => {
      const result = await importController.preview(
        { url: PRODUCT_URL },
        USER_ID,
        fetcherFailing(
          new RemoteFetchError("blocked_address", "Blocked 10.0.0.1"),
        ),
      );
      expect(result).toEqual({ ok: false, reason: "blocked_address" });
    });

    it("gives every failure the same response body", async () => {
      const app = createTestAppWithAuth(USER_ID);
      registerImportRoutes(app);
      const reasons = ["timeout", "too_large", "http_status"] as const;
      const bodies: unknown[] = [];
      for (const reason of reasons) {
        importController.resetImportState();
        vi.spyOn(importController, "preview").mockResolvedValueOnce({
          ok: false,
          reason,
        });
        const res = await post(app, "/import/preview", { url: PRODUCT_URL });
        expect(res.status).toBe(422);
        bodies.push(await res.json());
      }
      expect(new Set(bodies.map((b) => JSON.stringify(b))).size).toBe(1);
    });

    it("rate limits each user", async () => {
      const fetcher = fetcherReturning(sample("json-ld-product.html"));
      for (let i = 0; i < 10; i++) {
        const result = await importController.preview(
          { url: PRODUCT_URL },
          USER_ID,
          fetcher,
        );
        expect(result.ok).toBe(true);
      }
      const limited = await importController.preview(
        { url: PRODUCT_URL },
        USER_ID,
        fetcher,
      );
      expect(limited).toEqual({ ok: false, reason: "rate_limited" });
      const other = await importController.preview(
        { url: PRODUCT_URL },
        "other-user",
        fetcher,
      );
      expect(other.ok).toBe(true);
    });

    it("finds an existing wine and vintage", async () => {
      const maker = await seedMaker("Château Example");
      const wine = await insertReturning(db, "wine", {
        name: "Margaux",
        type: "red",
        wineMakerId: maker.id,
        regionId: null,
      });
      const vintage = await insertReturning(db, "vintage", {
        wineId: wine.id,
        year: 2015,
        drinkFrom: null,
        drinkUntil: null,
      });

      const result = await importController.preview(
        { url: PRODUCT_URL },
        USER_ID,
        fetcherReturning(sample("json-ld-product.html")),
      );
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.preview.resolution.winemaker).toMatchObject({
        status: "matched",
        id: maker.id,
      });
      expect(result.preview.existing).toEqual({
        wine: { id: wine.id, name: "Margaux" },
        vintage: { id: vintage.id, year: 2015 },
      });
    });
  });

  describe("commit", () => {
    const newWine = {
      name: "Margaux",
      type: "red" as const,
      winemaker: { name: "Château Example" },
      country: { name: "France" },
      region: { name: "Margaux" },
      grapes: [{ name: "Merlot" }, { name: "merlot" }],
    };
    const vintage = { year: 2015, drinkFrom: null, drinkUntil: null };

    it("reuses records that match by name", async () => {
      const maker = await seedMaker("Chateau Example");
      const result = await importController.commit({ wine: newWine, vintage });
      const wine = await db
        .selectFrom("wine")
        .selectAll()
        .where("id", "=", result.wineId)
        .executeTakeFirstOrThrow();
      expect(wine.wineMakerId).toBe(maker.id);
      const makers = await db.selectFrom("winemaker").select("id").execute();
      expect(makers).toHaveLength(1);
      const grapes = await db.selectFrom("grape").select("id").execute();
      expect(grapes).toHaveLength(1);
    });

    it("does not duplicate on a second submit", async () => {
      const first = await importController.commit({ wine: newWine, vintage });
      const second = await importController.commit({ wine: newWine, vintage });
      expect(second).toEqual({ ...first, created: false });
      expect(await db.selectFrom("wine").select("id").execute()).toHaveLength(
        1,
      );
      expect(
        await db.selectFrom("vintage").select("id").execute(),
      ).toHaveLength(1);
    });

    it("adds a vintage to an existing wine", async () => {
      const first = await importController.commit({ wine: newWine, vintage });
      const second = await importController.commit({
        wine: { id: first.wineId },
        vintage: { ...vintage, year: 2016 },
      });
      expect(second.wineId).toBe(first.wineId);
      expect(second.created).toBe(true);
    });

    it("rolls back everything when a step fails", async () => {
      await expect(
        importController.commit({
          wine: { ...newWine, grapes: [{ id: 9999 }] },
          vintage,
        }),
      ).rejects.toThrow(importController.ImportCommitError);
      expect(
        await db.selectFrom("winemaker").select("id").execute(),
      ).toHaveLength(0);
      expect(
        await db.selectFrom("country").select("id").execute(),
      ).toHaveLength(0);
      expect(await db.selectFrom("region").select("id").execute()).toHaveLength(
        0,
      );
      expect(await db.selectFrom("wine").select("id").execute()).toHaveLength(
        0,
      );
    });
  });
});
