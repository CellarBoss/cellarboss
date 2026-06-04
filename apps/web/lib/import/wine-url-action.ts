"use server";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { extractWineDetailsFromHtml } from "./wine-url";

const MAX_REDIRECTS = 3;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 12_000;

export type WineUrlImportResult =
  | { ok: true; data: ReturnType<typeof extractWineDetailsFromHtml> }
  | { ok: false; error: string };

export async function importWineFromUrl(
  inputUrl: string,
): Promise<WineUrlImportResult> {
  let currentUrl: URL;

  try {
    currentUrl = new URL(inputUrl);
  } catch {
    return { ok: false, error: "Enter a valid URL." };
  }

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    const validation = await validatePublicHttpUrl(currentUrl);
    if (!validation.ok) {
      return { ok: false, error: validation.error };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "CellarBoss-Wine-Importer/1.0",
        },
      });

      if (isRedirect(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          return { ok: false, error: "The URL redirected without a location." };
        }
        currentUrl = new URL(location, currentUrl);
        continue;
      }

      if (!response.ok) {
        return {
          ok: false,
          error: `The page returned HTTP ${response.status}.`,
        };
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("text/html")) {
        return { ok: false, error: "The URL did not return an HTML page." };
      }

      const html = await readLimitedResponse(response);
      return {
        ok: true,
        data: extractWineDetailsFromHtml(html, currentUrl.toString()),
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { ok: false, error: "The page took too long to respond." };
      }
      return { ok: false, error: "Could not import details from that URL." };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: false, error: "The URL redirected too many times." };
}

async function readLimitedResponse(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    return response.text();
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_RESPONSE_BYTES) {
      throw new Error("Response body is too large.");
    }
    chunks.push(value);
  }

  return new TextDecoder().decode(Buffer.concat(chunks));
}

async function validatePublicHttpUrl(
  url: URL,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, error: "Only HTTP and HTTPS URLs can be imported." };
  }

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0"
  ) {
    return { ok: false, error: "Local URLs cannot be imported." };
  }

  if (isPrivateAddress(hostname)) {
    return { ok: false, error: "Private network URLs cannot be imported." };
  }

  const addresses = await lookup(hostname, { all: true, verbatim: false });
  if (
    !addresses.length ||
    addresses.some((address) => isPrivateAddress(address.address))
  ) {
    return { ok: false, error: "Private network URLs cannot be imported." };
  }

  return { ok: true };
}

function isRedirect(status: number): boolean {
  return status >= 300 && status < 400;
}

function isPrivateAddress(address: string): boolean {
  const ipVersion = isIP(address);

  if (ipVersion === 4) {
    const [a = 0, b = 0] = address.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0
    );
  }

  if (ipVersion === 6) {
    const normalized = address.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }

  return false;
}
