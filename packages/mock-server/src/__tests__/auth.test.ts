import { beforeEach, describe, expect, it } from "vitest";
import type { Hono } from "hono";
import { createDefaultState, createMockApp, type MockState } from "../index";
import { isTrustedOrigin } from "../routes/auth";

function signIn(app: Hono, headers: Record<string, string> = {}) {
  return app.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      email: "admin@cellarboss.test",
      password: "password",
    }),
  });
}

describe("mock server auth", () => {
  let state: MockState;
  let app: Hono;

  beforeEach(() => {
    state = createDefaultState();
    app = createMockApp(state);
  });

  describe("/api/version", () => {
    it("reports a version like the backend", async () => {
      const res = await app.request("/api/version");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ version: "development" });
    });
  });

  describe("sign-in", () => {
    it("returns Better Auth's response shape and sets the session cookie", async () => {
      const res = await signIn(app);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        redirect: false,
        token: "token-admin",
        user: state.session!.user,
      });
      expect(res.headers.get("set-cookie")).toContain(
        "better-auth.session_token=token-admin",
      );
    });

    it("rejects wrong credentials", async () => {
      const res = await app.request("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "wrong@email.com", password: "x" }),
      });
      expect(res.status).toBe(401);
      expect(res.headers.get("set-cookie")).toBeNull();
    });

    it("rejects sign-in when no session is configured", async () => {
      state.session = null;
      const res = await signIn(app);
      expect(res.status).toBe(401);
    });
  });

  describe("sign-out", () => {
    it("clears the session and expires the cookie", async () => {
      const res = await app.request("/api/auth/sign-out", { method: "POST" });

      expect(res.status).toBe(200);
      expect(state.session).toBeNull();
      expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
    });
  });

  describe("origin check", () => {
    it.each([
      "cellarboss://",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ])("accepts %s", async (origin) => {
      const res = await signIn(app, { Origin: origin });
      expect(res.status).toBe(200);
    });

    it("accepts requests without an Origin header", async () => {
      const res = await signIn(app);
      expect(res.status).toBe(200);
    });

    it.each([
      "http://10.0.2.2:5174",
      "https://evil.example.com",
      "otherapp://",
    ])("refuses %s like Better Auth does", async (origin) => {
      const res = await signIn(app, { Origin: origin });
      expect(res.status).toBe(403);
      expect(await res.json()).toMatchObject({ code: "INVALID_ORIGIN" });
    });

    it("covers the admin routes under /api/auth", async () => {
      const res = await app.request("/api/auth/admin/create-user", {
        method: "POST",
        headers: { Origin: "https://evil.example.com" },
      });
      expect(res.status).toBe(403);
    });

    it("leaves GET requests alone", async () => {
      const res = await app.request("/api/auth/get-session", {
        headers: { Origin: "https://evil.example.com" },
      });
      expect(res.status).toBe(200);
    });

    it("does not treat lookalike hosts as local", () => {
      expect(isTrustedOrigin("http://localhost.evil.com")).toBe(false);
      expect(isTrustedOrigin("http://localhost:3000")).toBe(true);
    });
  });
});
