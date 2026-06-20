import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(),
}));

import { lookup } from "node:dns/promises";
import {
  isPrivateAddress,
  safeFetch,
  ScrapeFetchError,
} from "../scrape/fetcher";

const mockedLookup = vi.mocked(lookup);

function publicDns() {
  mockedLookup.mockResolvedValue([
    { address: "93.184.216.34", family: 4 },
  ] as never);
}

afterEach(() => {
  vi.restoreAllMocks();
  mockedLookup.mockReset();
});

describe("isPrivateAddress", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "192.168.0.1",
    "172.16.5.4",
    "169.254.1.1",
    "100.64.0.1",
    "0.0.0.0",
    "::1",
    "fe80::1",
    "fd00::1",
    "::ffff:10.0.0.1",
  ])("flags %s as private", (ip) => {
    expect(isPrivateAddress(ip)).toBe(true);
  });

  it.each(["8.8.8.8", "93.184.216.34", "172.32.0.1", "2606:4700:4700::1111"])(
    "allows public %s",
    (ip) => {
      expect(isPrivateAddress(ip)).toBe(false);
    },
  );
});

describe("safeFetch", () => {
  it("rejects non-http(s) protocols", async () => {
    await expect(safeFetch("ftp://example.com")).rejects.toBeInstanceOf(
      ScrapeFetchError,
    );
  });

  it("rejects literal private IPs without fetching", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expect(safeFetch("http://10.0.0.1/")).rejects.toThrow(/private/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects hosts that resolve to private addresses", async () => {
    mockedLookup.mockResolvedValue([
      { address: "10.0.0.5", family: 4 },
    ] as never);
    vi.stubGlobal("fetch", vi.fn());
    await expect(safeFetch("https://evil.example/")).rejects.toThrow(
      /private/i,
    );
  });

  it("returns HTML on success", async () => {
    publicDns();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html><body>ok</body></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
      ),
    );
    await expect(safeFetch("https://example.com/wine")).resolves.toContain(
      "ok",
    );
  });

  it("enforces the byte cap", async () => {
    publicDns();
    const huge = "x".repeat(3 * 1024 * 1024); // 3 MB > 2 MB cap
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(huge, {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
      ),
    );
    await expect(safeFetch("https://example.com/big")).rejects.toThrow(
      /too large/i,
    );
  });

  it("caps redirects", async () => {
    publicDns();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 301,
          headers: { location: "https://example.com/loop" },
        }),
      ),
    );
    await expect(safeFetch("https://example.com/start")).rejects.toThrow(
      /redirect/i,
    );
  });
});
