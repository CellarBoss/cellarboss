import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as countriesController from '@controllers/countries.controller.js';
import { createCountrySchema, updateCountrySchema } from '@cellarboss/validators';
import { requireAuth } from '@middleware/auth.middleware.js';

export function registerCountryRoutes(app: Hono) {
  const country = new Hono();

  country.use('*', requireAuth);

  country.get('/', async (c) => {
    const data = await countriesController.list();
    return c.json(data);
  });

  country.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await countriesController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  country.post('/', zValidator('json', createCountrySchema), async (c) => {
    const body = c.req.valid('json');
    const data = await countriesController.create(body);
    return c.json(data, 201);
  });

  country.put('/:id', zValidator('json', updateCountrySchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const data = await countriesController.update(id, body);
    return c.json(data);
  });

  country.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    await countriesController.remove(id);
    return c.json({ success: true });
  });

  app.route('/country', country);
}
