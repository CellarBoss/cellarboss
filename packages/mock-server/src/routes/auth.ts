import type { Hono } from "hono";
import type { MockState } from "../index";

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
    return c.json({ success: true });
  });

  // Sign-in endpoint (for login form tests)
  app.post("/api/auth/sign-in/email", async (c) => {
    const body = await c.req.json();
    if (body.email === "wrong@email.com" || body.password === "wrongpassword") {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    return c.json(state.session);
  });

  // Catch-all for other auth routes
  app.all("/api/auth/*", (c) => {
    return c.json({ error: "Not implemented in mock" }, 501);
  });
}
