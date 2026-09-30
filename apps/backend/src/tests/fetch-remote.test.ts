import { createServer, type Server } from "http";
import type { AddressInfo } from "net";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Agent } from "undici";
import {
  FETCH_LIMITS,
  RemoteFetchError,
  SafeFetcher,
  USER_AGENT,
  isPublicAddress,
} from "@utils/fetch-remote.js";

let server: Server;
let base: string;
let lastUserAgent: string | undefined;

beforeAll(async () => {
  server = createServer((req, res) => {
    lastUserAgent = req.headers["user-agent"];
    switch (req.url) {
      case "/page":
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return res.end("<html><title>Wine</title></html>");
      case "/data":
        res.writeHead(200, { "content-type": "application/json" });
        return res.end('{"name":"Wine"}');
      case "/redirect":
        res.writeHead(302, { location: "/page" });
        return res.end();
      case "/redirect-private":
        res.writeHead(302, { location: "http://10.0.0.1/admin" });
        return res.end();
      case "/redirect-file":
        res.writeHead(302, { location: "file:///etc/passwd" });
        return res.end();
      case "/loop":
        res.writeHead(302, { location: "/loop" });
        return res.end();
      case "/large":
        res.writeHead(200, { "content-type": "text/html" });
        return res.end("x".repeat(2048));
      case "/image":
        res.writeHead(200, { "content-type": "image/png" });
        return res.end("png");
      case "/slow":
        res.writeHead(200, { "content-type": "text/html" });
        res.write("<html>");
        return; // never ends
      default:
        res.writeHead(404, { "content-type": "text/html" });
        return res.end("missing");
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

// Only the local test server is allowed; everything else is treated as internal.
const localFetcher = (limits = FETCH_LIMITS) =>
  new SafeFetcher({
    limits,
    isAllowedAddress: (address) => address === "127.0.0.1",
    connection: { dispatcher: new Agent(), proxied: false },
  });

async function failure(promise: Promise<unknown>) {
  const error = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(RemoteFetchError);
  return (error as RemoteFetchError).reason;
}

describe("isPublicAddress", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "0.0.0.0",
    "::1",
    "fe80::1",
    "fc00::1",
    "::ffff:127.0.0.1",
    "100.64.0.1",
    "not-an-ip",
  ])("blocks %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(["8.8.8.8", "93.184.216.34", "2606:4700::1111"])(
    "allows %s",
    (address) => {
      expect(isPublicAddress(address)).toBe(true);
    },
  );
});

describe("SafeFetcher", () => {
  it("fetches HTML with the CellarBoss user agent", async () => {
    const doc = await localFetcher().fetch({
      url: new URL(`${base}/page`),
      accept: "html",
    });
    expect(doc.contentType).toBe("html");
    expect(doc.body).toContain("<title>Wine</title>");
    expect(lastUserAgent).toBe(USER_AGENT);
  });

  it("fetches JSON", async () => {
    const doc = await localFetcher().fetch({
      url: new URL(`${base}/data`),
      accept: "json",
    });
    expect(doc).toMatchObject({ contentType: "json", via: "api" });
  });

  it("follows redirects and reports the final URL", async () => {
    const doc = await localFetcher().fetch({
      url: new URL(`${base}/redirect`),
      accept: "html",
    });
    expect(doc.url.pathname).toBe("/page");
  });

  it("blocks private addresses with the default guard", async () => {
    const fetcher = new SafeFetcher({
      connection: { dispatcher: new Agent(), proxied: false },
    });
    expect(
      await failure(
        fetcher.fetch({ url: new URL(`${base}/page`), accept: "html" }),
      ),
    ).toBe("blocked_address");
  });

  it("blocks a redirect to a private address", async () => {
    expect(
      await failure(
        localFetcher().fetch({
          url: new URL(`${base}/redirect-private`),
          accept: "html",
        }),
      ),
    ).toBe("blocked_address");
  });

  it("blocks a redirect to another protocol", async () => {
    expect(
      await failure(
        localFetcher().fetch({
          url: new URL(`${base}/redirect-file`),
          accept: "html",
        }),
      ),
    ).toBe("invalid_url");
  });

  it("rejects credentials in the URL", async () => {
    const url = new URL(`${base}/page`);
    url.username = "admin";
    expect(await failure(localFetcher().fetch({ url, accept: "html" }))).toBe(
      "invalid_url",
    );
  });

  it("stops after too many redirects", async () => {
    expect(
      await failure(
        localFetcher().fetch({ url: new URL(`${base}/loop`), accept: "html" }),
      ),
    ).toBe("http_status");
  });

  it("caps the response size", async () => {
    const fetcher = localFetcher({ ...FETCH_LIMITS, maxBytes: 1024 });
    expect(
      await failure(
        fetcher.fetch({ url: new URL(`${base}/large`), accept: "html" }),
      ),
    ).toBe("too_large");
  });

  it("rejects content that is not HTML or JSON", async () => {
    expect(
      await failure(
        localFetcher().fetch({ url: new URL(`${base}/image`), accept: "html" }),
      ),
    ).toBe("unsupported_content");
  });

  it("reports HTTP errors", async () => {
    const error = await localFetcher()
      .fetch({ url: new URL(`${base}/nope`), accept: "html" })
      .catch((e: RemoteFetchError) => e);
    expect(error).toMatchObject({ reason: "http_status", status: 404 });
  });

  it("times out", async () => {
    const fetcher = localFetcher({ ...FETCH_LIMITS, timeoutMs: 200 });
    expect(
      await failure(
        fetcher.fetch({ url: new URL(`${base}/slow`), accept: "html" }),
      ),
    ).toBe("timeout");
  });
});
