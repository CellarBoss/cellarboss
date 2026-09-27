import { beforeEach, describe, expect, it } from "vitest";
import type { Hono } from "hono";
import { createDefaultState, createMockApp, type MockState } from "../index";

function post(app: Hono, path: string, body: unknown) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const newWine = {
  name: "Margaux",
  type: "red",
  winemaker: { name: "Château Example" },
  country: { name: "France" },
  region: { name: "Margaux" },
  grapes: [{ name: "Merlot" }],
};
const vintage = { year: 2015, drinkFrom: null, drinkUntil: null };

describe("mock server import", () => {
  let state: MockState;
  let app: Hono;

  beforeEach(() => {
    state = createDefaultState();
    app = createMockApp(state);
  });

  it("returns a canned preview", async () => {
    const res = await post(app, "/api/import/preview", {
      url: "https://shop.example.com/margaux-2015",
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { wine: { name: { value: string } } };
    expect(data.wine.name.value).toBe("Margaux");
  });

  it("fails for unknown pages", async () => {
    const res = await post(app, "/api/import/preview", {
      url: "https://shop.example.com/unknown",
    });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "IMPORT_FAILED" });
  });

  it("commits to state and finds the result on the next preview", async () => {
    const wines = state.wines.length;
    const res = await post(app, "/api/import/commit", {
      wine: newWine,
      vintage,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ created: true });
    expect(state.wines).toHaveLength(wines + 1);

    const again = await post(app, "/api/import/commit", {
      wine: newWine,
      vintage,
    });
    expect(await again.json()).toMatchObject({ created: false });

    const preview = await post(app, "/api/import/preview", {
      url: "https://shop.example.com/margaux-2015",
    });
    const data = (await preview.json()) as {
      existing: { wine: unknown; vintage: unknown };
    };
    expect(data.existing.wine).not.toBeNull();
    expect(data.existing.vintage).not.toBeNull();
  });
});
