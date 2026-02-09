import type { Context } from 'hono';
import { NoResultError } from 'kysely';

export function errorHandler(err: Error, c: Context) {
  console.error(`[${c.req.method}] ${c.req.path}:`, err.message);

  if (err instanceof NoResultError) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ error: 'Internal server error' }, 500);
}
