import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { ServerType } from "@hono/node-server";
import { registerAuthRoutes } from "./routes/auth";
import { registerWineRoutes } from "./routes/wines";
import { registerBottleRoutes } from "./routes/bottles";
import { registerWinemakerRoutes } from "./routes/winemakers";
import { registerVintageRoutes } from "./routes/vintages";
import { registerRegionRoutes } from "./routes/regions";
import { registerCountryRoutes } from "./routes/countries";
import { registerGrapeRoutes } from "./routes/grapes";
import { registerStorageRoutes } from "./routes/storages";
import { registerLocationRoutes } from "./routes/locations";
import { registerSettingsRoutes } from "./routes/settings";
import { registerUserRoutes } from "./routes/users";
import { registerWinegrapeRoutes } from "./routes/winegrapes";
import { registerTastingNoteRoutes } from "./routes/tasting-notes";
import { defaultState } from "./defaults";

export type SessionPayload = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
  };
  session: {
    id: string;
    token: string;
    expiresAt: string;
  };
};

export type MockState = {
  session: SessionPayload | null;
  wines: any[];
  winemakers: any[];
  vintages: any[];
  regions: any[];
  countries: any[];
  grapes: any[];
  bottles: any[];
  storages: any[];
  locations: any[];
  settings: any[];
  users: any[];
  wineGrapes: any[];
  tastingNotes: any[];
};

let server: ServerType | null = null;
let state: MockState;

export function getMockState(): MockState {
  return state;
}

export async function startMockServer(port: number): Promise<ServerType> {
  state = JSON.parse(JSON.stringify(defaultState));

  const app = new Hono();

  // Control endpoints for test setup
  app.post("/__test/set-session", async (c) => {
    state.session = await c.req.json();
    return c.json({ ok: true });
  });

  app.post("/__test/set-state", async (c) => {
    const partial = await c.req.json();
    Object.assign(state, partial);
    return c.json({ ok: true });
  });

  app.post("/__test/reset", (c) => {
    const { session } = state;
    const fresh = JSON.parse(JSON.stringify(defaultState));
    // Mutate in place so route handler closures (which captured the original
    // object reference) continue to see the updated state after reset.
    (Object.keys(state) as Array<keyof MockState>).forEach(
      (key) => delete state[key],
    );
    Object.assign(state, fresh);
    state.session = session;
    return c.json({ ok: true });
  });

  // Register all domain routes
  // User routes must be registered before auth routes because auth has a
  // catch-all /api/auth/* that would intercept /api/auth/admin/* endpoints
  registerUserRoutes(app, state);
  registerAuthRoutes(app, state);
  registerWineRoutes(app, state);
  registerBottleRoutes(app, state);
  registerWinemakerRoutes(app, state);
  registerVintageRoutes(app, state);
  registerRegionRoutes(app, state);
  registerCountryRoutes(app, state);
  registerGrapeRoutes(app, state);
  registerStorageRoutes(app, state);
  registerLocationRoutes(app, state);
  registerSettingsRoutes(app, state);
  registerWinegrapeRoutes(app, state);
  registerTastingNoteRoutes(app, state);

  return new Promise((resolve) => {
    server = serve({ fetch: app.fetch, port }, () => {
      console.log(`[mock-server] Listening on http://localhost:${port}`);
      resolve(server!);
    });
  });
}

export function stopMockServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
      server = null;
    } else {
      resolve();
    }
  });
}
