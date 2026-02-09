import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as locationsController from '@controllers/locations.controller.js';
import { createLocationSchema, updateLocationSchema } from '@cellarboss/validators';
import { requireAuth } from '@middleware/auth.middleware.js';

export function registerLocationRoutes(app: Hono) {
  const location = new Hono();

  location.use('*', requireAuth);

  location.get('/', async (c) => {
    const data = await locationsController.list();
    return c.json(data);
  });

  location.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await locationsController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  location.post('/', zValidator('json', createLocationSchema), async (c) => {
    const body = c.req.valid('json');
    const data = await locationsController.create(body);
    return c.json(data, 201);
  });

  location.put('/:id', zValidator('json', updateLocationSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const data = await locationsController.update(id, body);
    return c.json(data);
  });

  location.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    await locationsController.remove(id);
    return c.json({ success: true });
  });

  app.route('/location', location);
}
