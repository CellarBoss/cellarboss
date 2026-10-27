import { describe, it, expect } from "vitest";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { bearer } from "better-auth/plugins";
import { auth, getTrustedOrigins, MOBILE_APP_ORIGIN } from "@utils/auth.js";

describe("getTrustedOrigins", () => {
  it("defaults to the local web frontend plus the mobile app", () => {
    expect(getTrustedOrigins(undefined)).toEqual([
      "http://localhost:3000",
      MOBILE_APP_ORIGIN,
    ]);
  });

  it("splits and trims a comma-separated CORS value", () => {
    expect(
      getTrustedOrigins("https://cellar.example.com, http://nas.local:3000"),
    ).toEqual([
      "https://cellar.example.com",
      "http://nas.local:3000",
      MOBILE_APP_ORIGIN,
    ]);
  });

  it("ignores empty entries", () => {
    expect(getTrustedOrigins("https://cellar.example.com,,")).toEqual([
      "https://cellar.example.com",
      MOBILE_APP_ORIGIN,
    ]);
  });
});

describe("auth config", () => {
  it("trusts the mobile app origin", () => {
    expect(auth.options.trustedOrigins).toContain(MOBILE_APP_ORIGIN);
  });
});

describe("sign-in origin check", () => {
  // Same origin rules as the real config, on an in-memory store so the test
  // exercises Better Auth's own origin middleware without a migrated database.
  const testAuth = betterAuth({
    basePath: "/api/auth",
    baseURL: "http://localhost:5000",
    secret: "test-secret-that-is-at-least-32-characters-long",
    trustedOrigins: getTrustedOrigins(undefined),
    database: memoryAdapter({
      user: [],
      session: [],
      account: [],
      verification: [],
    }),
    emailAndPassword: { enabled: true },
    plugins: [bearer()],
    // Better Auth skips the origin check when NODE_ENV=test; force it on.
    advanced: { disableOriginCheck: false },
  });

  // A Cookie header makes Better Auth enforce the origin check, which is what
  // happens on Android once the native cookie store holds a session cookie.
  function signIn(headers: Record<string, string>) {
    return testAuth.handler(
      new Request("http://localhost:5000/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "unrelated=1",
          ...headers,
        },
        body: JSON.stringify({
          email: "nobody@example.com",
          password: "not-a-real-password",
        }),
      }),
    );
  }

  it("accepts the mobile app origin", async () => {
    const res = await signIn({ Origin: MOBILE_APP_ORIGIN });
    // Passes the origin check and fails on the (unknown) credentials instead
    expect(res.status).toBe(401);
  });

  it("accepts the configured web frontend origin", async () => {
    const res = await signIn({ Origin: "http://localhost:3000" });
    expect(res.status).toBe(401);
  });

  it("rejects an untrusted origin", async () => {
    const res = await signIn({ Origin: "https://evil.example.com" });
    expect(res.status).toBe(403);
  });

  it("rejects an address that is not in CORS", async () => {
    const res = await signIn({ Origin: "http://nas.local:5000" });
    expect(res.status).toBe(403);
  });

  it("rejects a request with a cookie but no origin", async () => {
    const res = await signIn({});
    expect(res.status).toBe(403);
  });

  it("rejects a different custom scheme", async () => {
    const res = await signIn({ Origin: "otherapp://" });
    expect(res.status).toBe(403);
  });
});
