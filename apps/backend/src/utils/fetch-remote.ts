import { lookup as dnsLookup } from "dns";
import { isIP } from "net";
import ipaddr from "ipaddr.js";
import {
  Agent,
  EnvHttpProxyAgent,
  ProxyAgent,
  Socks5ProxyAgent,
  fetch,
  type Dispatcher,
  type Response,
} from "undici";
import { env } from "@utils/env.js";
import type {
  FetchedDocument,
  Fetcher,
  FetchRequest,
} from "../import/types.js";

/** Why a remote fetch failed. Logged, never shown to users. */
export type FetchFailureReason =
  | "invalid_url"
  | "blocked_address"
  | "dns"
  | "network"
  | "timeout"
  | "proxy"
  | "http_status"
  | "too_large"
  | "unsupported_content";

export class RemoteFetchError extends Error {
  constructor(
    readonly reason: FetchFailureReason,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "RemoteFetchError";
  }
}

export const FETCH_LIMITS = {
  timeoutMs: 10_000,
  maxBytes: 3 * 1024 * 1024,
  maxRedirects: 5,
};

/**
 * Identifies CellarBoss in the "compatible" form crawlers use. Some sites'
 * firewalls (Vivino's, for one) reject a user agent that starts with an
 * unknown product name.
 */
export const USER_AGENT = `Mozilla/5.0 (compatible; CellarBoss/${env.APP_VERSION}; +https://cellarboss.org)`;

/** Only public unicast addresses may be fetched: no loopback, private or link-local. */
export function isPublicAddress(address: string): boolean {
  if (!ipaddr.isValid(address)) return false;
  let parsed = ipaddr.parse(address);
  if (
    parsed.kind() === "ipv6" &&
    (parsed as ipaddr.IPv6).isIPv4MappedAddress()
  ) {
    parsed = (parsed as ipaddr.IPv6).toIPv4Address();
  }
  return parsed.range() === "unicast";
}

// Resolves hosts for direct connections and refuses non-public addresses at
// connect time, so a redirect or DNS rebinding can't reach internal hosts.
const guardedLookup: typeof dnsLookup = ((
  hostname: string,
  options: object,
  callback: (
    err: NodeJS.ErrnoException | null,
    address: string | { address: string; family: number }[],
    family?: number,
  ) => void,
) => {
  dnsLookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, []);
    const blocked = addresses.find((a) => !isPublicAddress(a.address));
    if (blocked) {
      const error: NodeJS.ErrnoException = new Error(
        `Blocked address ${blocked.address} for ${hostname}`,
      );
      error.code = "EBLOCKED";
      return callback(error, []);
    }
    if ((options as { all?: boolean }).all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}) as typeof dnsLookup;

function createDispatcher(): { dispatcher: Dispatcher; proxied: boolean } {
  const proxyUrl = env.IMPORT_PROXY_URL;
  if (proxyUrl) {
    const url = new URL(proxyUrl);
    const dispatcher = url.protocol.startsWith("socks")
      ? new Socks5ProxyAgent(url)
      : new ProxyAgent(url.href);
    return { dispatcher, proxied: true };
  }
  if (
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy
  ) {
    return { dispatcher: new EnvHttpProxyAgent(), proxied: true };
  }
  return {
    dispatcher: new Agent({ connect: { lookup: guardedLookup } }),
    proxied: false,
  };
}

let shared: { dispatcher: Dispatcher; proxied: boolean } | undefined;

/**
 * Checks a URL before any request: http(s) only, and a host that resolves
 * to public addresses. With a proxy the proxy resolves the host, so this
 * pre-check is the guard; without one, `guardedLookup` also checks at
 * connect time.
 */
async function assertFetchable(
  url: URL,
  isAllowed: (address: string) => boolean,
): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RemoteFetchError(
      "invalid_url",
      `Unsupported protocol ${url.protocol}`,
    );
  }
  if (url.username || url.password) {
    throw new RemoteFetchError("invalid_url", "Credentials in URL");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) {
    if (!isAllowed(host))
      throw new RemoteFetchError("blocked_address", `Blocked address ${host}`);
    return;
  }
  const addresses = await new Promise<{ address: string }[]>(
    (resolve, reject) =>
      dnsLookup(host, { all: true }, (err, result) =>
        err ? reject(err) : resolve(result),
      ),
  ).catch((error: unknown) => {
    throw new RemoteFetchError(
      "dns",
      `DNS lookup failed for ${host}: ${String(error)}`,
    );
  });
  const blocked = addresses.find((a) => !isAllowed(a.address));
  if (blocked) {
    throw new RemoteFetchError(
      "blocked_address",
      `Blocked address ${blocked.address} for ${host}`,
    );
  }
}

function classify(error: unknown, proxied: boolean): RemoteFetchError {
  if (error instanceof RemoteFetchError) return error;
  const err = error as {
    name?: string;
    code?: string;
    cause?: { code?: string; name?: string };
  };
  const code = err.cause?.code ?? err.code;
  if (err.name === "TimeoutError" || err.cause?.name === "TimeoutError") {
    return new RemoteFetchError("timeout", "Request timed out");
  }
  if (code === "EBLOCKED")
    return new RemoteFetchError("blocked_address", String(error));
  if (code === "ENOTFOUND" || code === "EAI_AGAIN")
    return new RemoteFetchError("dns", String(code));
  if (
    proxied &&
    (code === "UND_ERR_ABORTED" ||
      code === "ECONNREFUSED" ||
      /proxy/i.test(String(err.cause ?? error)))
  ) {
    return new RemoteFetchError("proxy", String(code ?? "proxy error"));
  }
  return new RemoteFetchError("network", String(code ?? error));
}

async function readCapped(
  response: Response,
  maxBytes: number,
): Promise<string> {
  const declared = Number(response.headers.get("content-length"));
  if (declared > maxBytes)
    throw new RemoteFetchError("too_large", `Declared ${declared} bytes`);

  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RemoteFetchError("too_large", `Body over ${maxBytes} bytes`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function contentTypeOf(response: Response): "html" | "json" | undefined {
  const type = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (type.includes("json")) return "json";
  if (type.includes("text/html") || type.includes("application/xhtml"))
    return "html";
  return undefined;
}

/**
 * The one way the backend fetches third-party pages: SSRF-checked on every
 * hop, time- and size-limited, HTML or JSON only, honestly identified, and
 * routed through IMPORT_PROXY_URL or the standard proxy variables when set.
 */
export interface SafeFetcherOptions {
  limits?: typeof FETCH_LIMITS;
  /** Tests allow loopback here to reach a local server. */
  isAllowedAddress?: (address: string) => boolean;
  connection?: { dispatcher: Dispatcher; proxied: boolean };
}

export class SafeFetcher implements Fetcher {
  private readonly limits: typeof FETCH_LIMITS;
  private readonly isAllowed: (address: string) => boolean;
  private readonly connection: { dispatcher: Dispatcher; proxied: boolean };

  constructor(options: SafeFetcherOptions = {}) {
    this.limits = options.limits ?? FETCH_LIMITS;
    this.isAllowed = options.isAllowedAddress ?? isPublicAddress;
    this.connection = options.connection ?? (shared ??= createDispatcher());
  }

  async fetch({ url, accept }: FetchRequest): Promise<FetchedDocument> {
    let current = new URL(url);
    const signal = AbortSignal.timeout(this.limits.timeoutMs);

    for (let hop = 0; hop <= this.limits.maxRedirects; hop++) {
      await assertFetchable(current, this.isAllowed);

      let response: Response;
      try {
        response = await fetch(current, {
          redirect: "manual",
          signal,
          dispatcher: this.connection.dispatcher,
          headers: {
            "user-agent": USER_AGENT,
            accept:
              accept === "json"
                ? "application/json"
                : "text/html,application/xhtml+xml",
            "accept-language": "en-GB,en;q=0.9",
          },
        });
      } catch (error) {
        throw classify(error, this.connection.proxied);
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location)
          throw new RemoteFetchError(
            "http_status",
            "Redirect without location",
            response.status,
          );
        current = new URL(location, current);
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new RemoteFetchError(
          "http_status",
          `HTTP ${response.status}`,
          response.status,
        );
      }

      const contentType = contentTypeOf(response);
      if (!contentType) {
        await response.body?.cancel();
        throw new RemoteFetchError(
          "unsupported_content",
          response.headers.get("content-type") ?? "none",
        );
      }
      const body = await readCapped(response, this.limits.maxBytes).catch(
        (error: unknown) => {
          throw classify(error, this.connection.proxied);
        },
      );
      return {
        url: current,
        contentType,
        body,
        via: accept === "json" ? "api" : "http",
      };
    }
    throw new RemoteFetchError("http_status", "Too many redirects");
  }
}
