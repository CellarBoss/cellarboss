import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as bottlesController from '@controllers/bottles.controller.js';
import { createBottleSchema, updateBottleSchema } from '@cellarboss/validators';
import { requireAuth } from '@middleware/auth.middleware.js';

export function registerBottleRoutes(app: Hono) {
  const bottle = new Hono();

  // Apply auth middleware to all routes
  bottle.use('*', requireAuth);

  // GET /api/bottle
  bottle.get('/', async (c) => {
    const data = await bottlesController.list();
    return c.json(data);
  });

  // GET /api/bottle/:id
  bottle.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await bottlesController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  // POST /api/bottle
  bottle.post('/', zValidator('json', createBottleSchema), async (c) => {
    const body = c.req.valid('json');
    const data = await bottlesController.create(body);
    return c.json(data, 201);
  });

  // PUT /api/bottle/:id
  bottle.put('/:id', zValidator('json', updateBottleSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const data = await bottlesController.update(id, body);
    return c.json(data);
  });

  // DELETE /api/bottle/:id
  bottle.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    await bottlesController.remove(id);
    return c.json({ success: true });
  });

  app.route('/bottle', bottle);
}
