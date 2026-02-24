import type { Context } from "hono";
import { NoResultError } from "kysely";

function isUniqueConstraintError(err: any): boolean {
  // SQLite
  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") return true;
  // PostgreSQL
  if (err.code === "23505") return true;
  // MySQL
  if (err.errno === 1062) return true;
  return false;
}

export function errorHandler(err: Error, c: Context) {
  console.error(`[${c.req.method}] ${c.req.path}:`, err.message);

  if (err instanceof NoResultError) {
    return c.json({ error: "Not found" }, 404);
  }

  if (isUniqueConstraintError(err)) {
    return c.json({ error: "A record with these values already exists" }, 409);
  }

  return c.json({ error: "Internal server error" }, 500);
}
