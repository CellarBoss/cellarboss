import type { Hono } from "hono";
import { StreamableHTTPTransport } from "@hono/mcp";
import { mcpServer } from "./server.js";

// Stateless, unauthenticated transport: no sessionIdGenerator, so every
// request is handled independently and JSON-RPC responses come back as
// plain JSON instead of an SSE stream.
export function registerMcpRoutes(app: Hono<any>) {
  const transport = new StreamableHTTPTransport({ enableJsonResponse: true });

  app.all("/mcp", async (c) => {
    if (!mcpServer.isConnected()) {
      await mcpServer.connect(transport);
    }
    return transport.handleRequest(c);
  });
}
