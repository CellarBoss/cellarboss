import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as grapesController from '@controllers/grapes.controller.js';
import { createGrapeSchema, updateGrapeSchema } from '@cellarboss/validators';
import { requireAuth } from '@middleware/auth.middleware.js';
import { parseId } from '@utils/id.js';

export function registerGrapeRoutes(app: Hono) {
  const grape = new Hono();

  grape.use('*', requireAuth);

  grape.get('/', async (c) => {
    const data = await grapesController.list();
    return c.json(data);
  });

  grape.get('/:id', async (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, 400);
    const data = await grapesController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  grape.post('/', zValidator('json', createGrapeSchema), async (c) => {
    const body = c.req.valid('json');
    const data = await grapesController.create(body);
    return c.json(data, 201);
  });

  grape.put('/:id', zValidator('json', updateGrapeSchema), async (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, 400);
    const body = c.req.valid('json');
    const data = await grapesController.update(id, body);
    return c.json(data);
  });

  grape.delete('/:id', async (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, 400);
    await grapesController.remove(id);
    return c.json({ success: true });
  });

  app.route('/grape', grape);
}
