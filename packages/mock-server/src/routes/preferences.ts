import type { Hono } from "hono";
import type { MockState } from "../index";
import { upsertPreferenceSchema } from "@cellarboss/validators";

export function registerPreferenceRoutes(app: Hono, state: MockState) {
  const currentUserId = () => state.session?.user.id ?? "anonymous";

  app.get("/api/user/preferences", (c) => {
    const userId = currentUserId();
    return c.json(state.preferences.filter((p) => p.userId === userId));
  });

  app.get("/api/user/preferences/:key", (c) => {
    const userId = currentUserId();
    const key = decodeURIComponent(c.req.param("key"));
    const preference = state.preferences.find(
      (p) => p.userId === userId && p.key === key,
    );
    if (!preference) return c.json({ error: "Not found" }, 404);
    return c.json(preference);
  });

  app.put("/api/user/preferences/:key", async (c) => {
    const userId = currentUserId();
    const key = decodeURIComponent(c.req.param("key"));
    const body = await c.req.json();
    const result = upsertPreferenceSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const idx = state.preferences.findIndex(
      (p) => p.userId === userId && p.key === key,
    );
    const preference = { userId, key, value: result.data.value };
    if (idx === -1) {
      state.preferences.push(preference);
    } else {
      state.preferences[idx] = preference;
    }
    return c.json(preference);
  });

  app.delete("/api/user/preferences/:key", (c) => {
    const userId = currentUserId();
    const key = decodeURIComponent(c.req.param("key"));
    state.preferences = state.preferences.filter(
      (p) => !(p.userId === userId && p.key === key),
    );
    return c.json({ success: true });
  });
}
