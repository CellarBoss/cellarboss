import { auth } from "@utils/auth.js";
import type { Context, Next } from "hono";

export async function requireAuth(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);
    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
}
