import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as winesController from '@controllers/wines.controller.js';
import { createWineSchema, updateWineSchema } from '@cellarboss/validators';
import { requireAuth } from '@middleware/auth.middleware.js';

export function registerWineRoutes(app: Hono) {
  const wine = new Hono();

  wine.use('*', requireAuth);

  wine.get('/', async (c) => {
    const data = await winesController.list();
    return c.json(data);
  });

  wine.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await winesController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  wine.post('/', zValidator('json', createWineSchema), async (c) => {
    const body = c.req.valid('json');
    const data = await winesController.create(body);
    return c.json(data, 201);
  });

  wine.put('/:id', zValidator('json', updateWineSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const data = await winesController.update(id, body);
    return c.json(data);
  });

  wine.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    try {
      await winesController.remove(id);
      return c.json({ success: true });
    } catch (e: any) {
      if (e.message?.includes('still has vintages')) {
        return c.json({ error: e.message }, 409);
      }
      throw e;
    }
  });

  app.route('/wine', wine);
}
