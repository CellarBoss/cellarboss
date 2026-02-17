import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as vintagesController from '@controllers/vintages.controller.js';
import { createVintageSchema, updateVintageSchema } from '@cellarboss/validators';
import { requireAuth } from '@middleware/auth.middleware.js';

export function registerVintageRoutes(app: Hono) {
  const vintage = new Hono();

  vintage.use('*', requireAuth);

  vintage.get('/', async (c) => {
    const data = await vintagesController.list();
    return c.json(data);
  });

  vintage.get('/wine/:wineId', async (c) => {
    const wineId = Number(c.req.param('wineId'));
    const data = await vintagesController.getByWineId(wineId);
    return c.json(data);
  });

  vintage.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await vintagesController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  vintage.post('/', zValidator('json', createVintageSchema), async (c) => {
    const body = c.req.valid('json');
    const data = await vintagesController.create(body);
    return c.json(data, 201);
  });

  vintage.put('/:id', zValidator('json', updateVintageSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const data = await vintagesController.update(id, body);
    return c.json(data);
  });

  vintage.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    await vintagesController.remove(id);
    return c.json({ success: true });
  });

  app.route('/vintage', vintage);
}
