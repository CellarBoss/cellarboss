import { describe, it, expect, vi } from "vitest";
import { createApiClient } from "../../client";
import type { RequestFn } from "../../types";

describe("createApiClient", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;

  it("returns all resource namespaces", () => {
    const client = createApiClient({ request: mockRequest });

    expect(client.wines).toBeDefined();
    expect(client.bottles).toBeDefined();
    expect(client.countries).toBeDefined();
    expect(client.regions).toBeDefined();
    expect(client.grapes).toBeDefined();
    expect(client.locations).toBeDefined();
    expect(client.storages).toBeDefined();
    expect(client.winemakers).toBeDefined();
    expect(client.vintages).toBeDefined();
    expect(client.winegrapes).toBeDefined();
    expect(client.tastingNotes).toBeDefined();
    expect(client.settings).toBeDefined();
    expect(client.users).toBeDefined();
  });

  it("each namespace has expected methods", () => {
    const client = createApiClient({ request: mockRequest });

    // Spot-check a few namespaces
    expect(typeof client.wines.getAll).toBe("function");
    expect(typeof client.wines.getById).toBe("function");
    expect(typeof client.wines.create).toBe("function");
    expect(typeof client.wines.update).toBe("function");
    expect(typeof client.wines.delete).toBe("function");

    expect(typeof client.settings.getAll).toBe("function");
    expect(typeof client.settings.getByKey).toBe("function");
    expect(typeof client.settings.update).toBe("function");

    expect(typeof client.winegrapes.getAll).toBe("function");
    expect(typeof client.winegrapes.getByWineId).toBe("function");
    expect(typeof client.winegrapes.create).toBe("function");
    expect(typeof client.winegrapes.delete).toBe("function");
  });
});
