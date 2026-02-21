import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as usersController from '@controllers/users.controller.js';
import { requireAuth } from '@middleware/auth.middleware.js';
import { requireAdmin } from '@middleware/admin.middleware.js';

const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.email().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export function registerUserRoutes(app: Hono) {
  const user = new Hono();

  user.use('*', requireAuth, requireAdmin);

  user.get('/:id', async (c) => {
    const id = c.req.param('id');
    const data = await usersController.getById(id);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json(data);
  });

  user.put('/:id', zValidator('json', updateUserSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const data = await usersController.update(id, body);
    return c.json(data);
  });

  app.route('/user', user);
}
