import type { Hono } from "hono";
import type { MockState } from "../index";

const SESSION_COOKIE = "better-auth.session_token";

// The backend trusts the web origins in CORS plus the mobile app's scheme
// (apps/backend/src/utils/auth.ts). Locally the web app runs on localhost.
const MOBILE_APP_ORIGIN = "cellarboss://";
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function isTrustedOrigin(origin: string): boolean {
  return (
    origin.toLowerCase().startsWith(MOBILE_APP_ORIGIN) ||
    LOCAL_ORIGIN.test(origin)
  );
}

/**
 * Mirrors Better Auth's origin check closely enough for E2E tests to catch a
 * client that sends the wrong Origin (see #1223): any request that changes
 * state under /api/auth and carries an untrusted Origin header is refused.
 * Must be registered before any /api/auth route.
 */
export function registerAuthOriginCheck(app: Hono) {
  app.use("/api/auth/*", async (c, next) => {
    const origin = c.req.header("origin");
    if (c.req.method !== "GET" && origin && !isTrustedOrigin(origin)) {
      return c.json({ code: "INVALID_ORIGIN", message: "Invalid origin" }, 403);
    }
    await next();
  });
}

export function registerAuthRoutes(app: Hono, state: MockState) {
  // Called by authClient.useSession() via the /api/auth proxy route
  app.get("/api/auth/get-session", (c) => {
    if (!state.session) {
      return c.json(null, 200);
    }
    return c.json(state.session);
  });

  // Called by /logout route handler
  app.post("/api/auth/sign-out", (c) => {
    state.session = null;
    c.header("Set-Cookie", `${SESSION_COOKIE}=; Path=/; Max-Age=0`);
    return c.json({ success: true });
  });

  // Sign-in endpoint (for login form tests)
  app.post("/api/auth/sign-in/email", async (c) => {
    const body = await c.req.json();
    if (body.email === "wrong@email.com" || body.password === "wrongpassword") {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    if (!state.session) {
      return c.json(
        {
          code: "INVALID_EMAIL_OR_PASSWORD",
          message: "Invalid email or password",
        },
        401,
      );
    }
    // Same shape and cookie as Better Auth, so cookie-based clients (the
    // mobile app's Expo client) store a session to send on later requests
    const { token } = state.session.session;
    c.header(
      "Set-Cookie",
      `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax`,
    );
    return c.json({ redirect: false, token, user: state.session.user });
  });

  // Mirrors Better Auth: update-user only changes the name and image, and
  // silently ignores anything else (including a password)
  app.post("/api/auth/update-user", async (c) => {
    if (!state.session) return c.json({ message: "Unauthorized" }, 401);
    const body = await c.req.json();
    if (body.name !== undefined) state.session.user.name = body.name;
    return c.json({ status: true });
  });

  app.post("/api/auth/change-password", async (c) => {
    if (!state.session) return c.json({ message: "Unauthorized" }, 401);
    const body = await c.req.json();
    if (body.currentPassword !== state.userPasswords[state.session.user.id]) {
      return c.json(
        { code: "INVALID_PASSWORD", message: "Invalid password" },
        400,
      );
    }
    state.userPasswords[state.session.user.id] = body.newPassword;
    return c.json({ token: null, user: state.session.user });
  });

  // Catch-all for other auth routes
  app.all("/api/auth/*", (c) => {
    return c.json({ error: "Not implemented in mock" }, 501);
  });
}
