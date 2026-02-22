import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as regionsController from '@controllers/regions.controller.js';
import { createRegionSchema, updateRegionSchema } from '@cellarboss/validators';
import { requireAuth } from '@middleware/auth.middleware.js';
import { parseId } from '@utils/id.js';

export function registerRegionRoutes(app: Hono) {
  const region = new Hono();

  region.use('*', requireAuth);

  region.get('/', async (c) => {
    const data = await regionsController.list();
    return c.json(data);
  });

  region.get('/:id', async (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, 400);
    const data = await regionsController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  region.post('/', zValidator('json', createRegionSchema), async (c) => {
    const body = c.req.valid('json');
    const data = await regionsController.create(body);
    return c.json(data, 201);
  });

  region.put('/:id', zValidator('json', updateRegionSchema), async (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, 400);
    const body = c.req.valid('json');
    const data = await regionsController.update(id, body);
    return c.json(data);
  });

  region.delete('/:id', async (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, 400);
    await regionsController.remove(id);
    return c.json({ success: true });
  });

  app.route('/region', region);
}
