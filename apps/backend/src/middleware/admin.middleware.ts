import type { Context, Next } from "hono";

export async function requireAdmin(c: Context, next: Next) {
  const user = c.get("user");

  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  return await next();
}
