import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as storagesController from '@controllers/storages.controller.js';
import { createStorageSchema, updateStorageSchema } from '@cellarboss/validators';
import { requireAuth } from '@middleware/auth.middleware.js';

export function registerStorageRoutes(app: Hono) {
  const storage = new Hono();

  storage.use('*', requireAuth);

  storage.get('/', async (c) => {
    const data = await storagesController.list();
    return c.json(data);
  });

  storage.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await storagesController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  storage.post('/', zValidator('json', createStorageSchema), async (c) => {
    const body = c.req.valid('json');
    const data = await storagesController.create(body);
    return c.json(data, 201);
  });

  storage.put('/:id', zValidator('json', updateStorageSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const data = await storagesController.update(id, body);
    return c.json(data);
  });

  storage.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    await storagesController.remove(id);
    return c.json({ success: true });
  });

  app.route('/storage', storage);
}
