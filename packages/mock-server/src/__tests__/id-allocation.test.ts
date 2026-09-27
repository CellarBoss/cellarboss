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

async function createCountry(app: Hono, name: string): Promise<number> {
  const res = await post(app, "/api/country", { name });
  expect(res.status).toBe(201);
  return ((await res.json()) as { id: number }).id;
}

describe("mock server ID allocation", () => {
  let state: MockState;
  let app: Hono;

  beforeEach(() => {
    state = createDefaultState();
    app = createMockApp(state);
  });

  it("allocates the next id after the seeded rows", async () => {
    const maxSeeded = Math.max(...state.countries.map((c) => c.id));
    expect(await createCountry(app, "Spain")).toBe(maxSeeded + 1);
  });

  it("does not reuse an id installed through /__test/set-state", async () => {
    await post(app, "/__test/set-state", {
      countries: [{ id: 5000, name: "Portugal" }],
    });

    const id = await createCountry(app, "Spain");

    expect(id).toBe(5001);
    const ids = state.countries.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not reuse the id of a deleted record", async () => {
    const id = await createCountry(app, "Spain");
    const res = await app.request(`/api/country/${id}`, { method: "DELETE" });
    expect(res.status).toBe(200);

    expect(await createCountry(app, "Portugal")).toBe(id + 1);
  });

  it("does not reuse the id of a deleted seeded record", async () => {
    const seededIds = state.countries.map((c) => c.id);
    const maxSeeded = Math.max(...seededIds);
    const res = await app.request(`/api/country/${maxSeeded}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(200);

    expect(await createCountry(app, "Spain")).toBe(maxSeeded + 1);
  });

  it("does not reuse the id of a deleted record installed by set-state", async () => {
    await post(app, "/__test/set-state", {
      countries: [{ id: 5000, name: "Portugal" }],
    });
    await app.request("/api/country/5000", { method: "DELETE" });

    expect(await createCountry(app, "Spain")).toBe(5001);
  });

  it("allocates the same ids again after /__test/reset", async () => {
    const first = await createCountry(app, "Spain");
    await post(app, "/__test/reset", {});
    const afterReset = await createCountry(app, "Spain");

    expect(afterReset).toBe(first);
  });

  it("names uploaded images after their allocated id", async () => {
    await post(app, "/__test/set-state", {
      images: [
        {
          id: 4000,
          vintageId: 1,
          filename: "4000.jpg",
          size: 1,
          isFavourite: false,
          createdBy: "admin-user-1",
          createdAt: new Date().toISOString(),
        },
      ],
    });
    const form = new FormData();
    form.set("vintageId", "1");
    form.set("file", new File([new Uint8Array([1])], "x.jpg"));

    const res = await app.request("/api/image/upload", {
      method: "POST",
      body: form,
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ id: 4001, filename: "4001.jpg" });
  });

  it("gives users created back to back distinct ids", async () => {
    const create = (email: string) =>
      post(app, "/api/auth/admin/create-user", { name: email, email });

    const [a, b] = await Promise.all([
      create("a@cellarboss.test"),
      create("b@cellarboss.test"),
    ]);
    const { id: idA } = (await a.json()) as { id: string };
    const { id: idB } = (await b.json()) as { id: string };

    expect(idA).not.toBe(idB);
    const ids = state.users.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
