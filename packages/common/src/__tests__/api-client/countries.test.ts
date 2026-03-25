import { describe, it, expect, vi, beforeEach } from "vitest";
import { countriesResource } from "../../resources/countries";
import type { RequestFn } from "../../types";

describe("countriesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let countries: ReturnType<typeof countriesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    countries = countriesResource(mockRequest);
  });

  it("getAll calls GET country", async () => {
    await countries.getAll();
    expect(mockRequest).toHaveBeenCalledWith("country", "GET");
  });

  it("getById calls GET country/{id}", async () => {
    await countries.getById(5);
    expect(mockRequest).toHaveBeenCalledWith("country/5", "GET");
  });

  it("create calls POST country with JSON body", async () => {
    const country = { id: 0, name: "France" };
    await countries.create(country as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "country",
      "POST",
      JSON.stringify(country),
    );
  });

  it("update calls PUT country/{id} with JSON body", async () => {
    const country = { id: 3, name: "Italy" };
    await countries.update(country as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "country/3",
      "PUT",
      JSON.stringify(country),
    );
  });

  it("delete calls DELETE country/{id}", async () => {
    await countries.delete(7);
    expect(mockRequest).toHaveBeenCalledWith("country/7", "DELETE");
  });
});
