import type { Hono } from "hono";
import type { MockState } from "../index";

export function registerUserRoutes(app: Hono, state: MockState) {
  // Better Auth admin list-users endpoint
  app.get("/api/auth/admin/list-users", (c) => {
    return c.json({ users: state.users, total: state.users.length });
  });

  // Better Auth admin create-user endpoint
  app.post("/api/auth/admin/create-user", async (c) => {
    const body = await c.req.json();
    const user = {
      id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      role: body.role || "user",
      createdAt: new Date().toISOString(),
      banned: null,
      banReason: null,
    };
    state.users.push(user);
    return c.json(user, 201);
  });

  // Better Auth admin remove-user endpoint
  app.post("/api/auth/admin/remove-user", async (c) => {
    const body = await c.req.json();
    const idx = state.users.findIndex((u) => u.id === body.userId);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.users.splice(idx, 1);
    return c.json({ success: true });
  });

  // Better Auth admin set-role endpoint
  app.post("/api/auth/admin/set-role", async (c) => {
    const body = await c.req.json();
    const idx = state.users.findIndex((u) => u.id === body.userId);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.users[idx].role = body.role;
    return c.json(state.users[idx]);
  });

  // Individual user endpoints
  app.get("/api/user/:id", (c) => {
    const id = c.req.param("id");
    const user = state.users.find((u) => u.id === id);
    if (!user) return c.json({ error: "Not found" }, 404);
    return c.json(user);
  });

  app.put("/api/user/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const idx = state.users.findIndex((u) => u.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    state.users[idx] = { ...state.users[idx], ...body };
    return c.json(state.users[idx]);
  });
}
