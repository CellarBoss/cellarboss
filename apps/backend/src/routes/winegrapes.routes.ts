import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as winegrapesController from '@controllers/winegrapes.controller.js';
import { createWineGrapeSchema, updateWineGrapeSchema } from '@cellarboss/validators';
import { requireAuth } from '@middleware/auth.middleware.js';

export function registerWineGrapeRoutes(app: Hono) {
  const winegrape = new Hono();

  winegrape.use('*', requireAuth);

  winegrape.get('/', async (c) => {
    const data = await winegrapesController.list();
    return c.json(data);
  });

  winegrape.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await winegrapesController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  winegrape.get('/wine/:wineId', async (c) => {
    const wineId = Number(c.req.param('wineId'));
    const data = await winegrapesController.getByWineId(wineId);
    return c.json(data);
  });

  winegrape.post('/', zValidator('json', createWineGrapeSchema), async (c) => {
    const body = c.req.valid('json');
    const data = await winegrapesController.create(body);
    return c.json(data, 201);
  });

  winegrape.put('/:id', zValidator('json', updateWineGrapeSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const data = await winegrapesController.update(id, body);
    return c.json(data);
  });

  winegrape.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    await winegrapesController.remove(id);
    return c.json({ success: true });
  });

  app.route('/winegrape', winegrape);
}
