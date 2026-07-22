import type { Hono } from "hono";
import { StreamableHTTPTransport } from "@hono/mcp";
import { createMcpServer } from "./server.js";

// Stateless, unauthenticated transport: a fresh server + transport pair is
// created for every request (no sessionIdGenerator, no shared connection).
// A single shared transport would let concurrent requests collide on
// internal request-id bookkeeping when two clients happen to reuse the same
// JSON-RPC id, and the SDK throws if connect() is called twice on the same
// server without an intervening close().
export function registerMcpRoutes(app: Hono<any>) {
  app.all("/mcp", async (c) => {
    const mcpServer = createMcpServer();
    const transport = new StreamableHTTPTransport({ enableJsonResponse: true });
    await mcpServer.connect(transport);
    try {
      return await transport.handleRequest(c);
    } finally {
      await transport.close();
      await mcpServer.close();
    }
  });
}
