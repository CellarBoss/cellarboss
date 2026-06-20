import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import ipaddr from "ipaddr.js";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB cap on every response path
const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 10_000;

/** Error thrown for any disallowed or failed fetch, safe to surface to users. */
export class ScrapeFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScrapeFetchError";
  }
}

/**
 * Reject loopback, link-local, private and other non-routable addresses.
 * Anything that isn't a globally-routable unicast address is treated as
 * private — that includes broadcast, multicast, reserved and CGNAT ranges.
 */
export function isPrivateAddress(ip: string): boolean {
  // Not a literal IP (or malformed) — caller resolves DNS and re-checks.
  if (!ipaddr.isValid(ip)) return false;

  let addr = ipaddr.parse(ip);
  if (addr.kind() === "ipv6") {
    const v6 = addr as ipaddr.IPv6;
    // IPv4-mapped (::ffff:a.b.c.d) — re-check the embedded v4 address.
    if (v6.isIPv4MappedAddress()) addr = v6.toIPv4Address();
  }
  return addr.range() !== "unicast";
}

/** Validate the URL shape and resolve its host, rejecting private targets. */
async function assertPublicUrl(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ScrapeFetchError("Only http(s) URLs can be imported");
  }

  const host = url.hostname;
  if (host === "localhost") {
    throw new ScrapeFetchError("Refusing to fetch a local address");
  }

  // If the host is already a literal IP, validate it directly.
  if (isIP(host)) {
    if (isPrivateAddress(host)) {
      throw new ScrapeFetchError("Refusing to fetch a private network address");
    }
    return;
  }

  let resolved;
  try {
    resolved = await lookup(host, { all: true });
  } catch {
    throw new ScrapeFetchError(`Could not resolve host: ${host}`);
  }
  if (
    resolved.length === 0 ||
    resolved.some((r) => isPrivateAddress(r.address))
  ) {
    throw new ScrapeFetchError("Refusing to fetch a private network address");
  }
}

/** Read a response body, aborting if it exceeds the byte cap. */
async function readCapped(res: Response): Promise<string> {
  const body = res.body;
  if (!body) {
    const text = await res.text();
    if (Buffer.byteLength(text) > MAX_BYTES) {
      throw new ScrapeFetchError("Page is too large to import");
    }
    return text;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > MAX_BYTES) {
          throw new ScrapeFetchError("Page is too large to import");
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString("utf-8");
}

/**
 * Fetch a page's HTML with SSRF protection, a redirect cap, a size cap and a
 * timeout. Redirects are followed manually so each hop is re-validated against
 * the private-address rules — this is the shared default fetch for adapters.
 */
export async function safeFetch(input: string | URL): Promise<string> {
  let url: URL;
  try {
    url = input instanceof URL ? input : new URL(input);
  } catch {
    throw new ScrapeFetchError("That doesn't look like a valid URL");
  }

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          // A realistic UA + Accept so retailers serve the full HTML page.
          "User-Agent":
            "Mozilla/5.0 (compatible; CellarBoss/1.0; +https://cellarboss.app)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new ScrapeFetchError("Timed out fetching the page");
      }
      throw new ScrapeFetchError("Failed to fetch the page");
    } finally {
      clearTimeout(timeout);
    }

    // Follow redirects manually so each new location is re-validated.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        throw new ScrapeFetchError("Redirect without a location");
      }
      url = new URL(location, url);
      continue;
    }

    if (!res.ok) {
      throw new ScrapeFetchError(`Page returned status ${res.status}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (
      contentType &&
      !/text\/html|application\/xhtml\+xml/i.test(contentType)
    ) {
      throw new ScrapeFetchError("That URL is not an HTML page");
    }

    return readCapped(res);
  }

  throw new ScrapeFetchError("Too many redirects");
}
