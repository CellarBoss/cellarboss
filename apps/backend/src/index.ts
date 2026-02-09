import 'dotenv/config';
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { auth } from '@utils/auth.js';
import { cors } from 'hono/cors';
import { env } from '@utils/env.js';
import { registerRoutes } from '@routes/index.js';
import { errorHandler } from '@middleware/error.middleware.js';

const app = new Hono();

app.onError(errorHandler);

app.use(
	"*",
	cors({
		origin: env.CORS || (env.NODE_ENV === 'development' ? 'http://localhost:5173' : ''),
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.get('/', (c) => {
  return c.text('Hello World!')
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

// Register API routes
const api = new Hono();
registerRoutes(api);
app.route('/api', api);

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
