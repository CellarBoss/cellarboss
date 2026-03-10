import { OpenAPIHono } from "@hono/zod-openapi";
import type { CreateCountry, UpdateCountry } from "@cellarboss/types";
import * as countriesController from "@controllers/countries.controller.js";
import {
  createCountrySchema,
  updateCountrySchema,
} from "@cellarboss/validators";
import { requireAuth } from "@middleware/auth.middleware.js";
import { parseId } from "@utils/id.js";
import { createCrudRoutes } from "@openapi/helpers.js";
import { countryResponseSchema } from "@openapi/schemas.js";

const routes = createCrudRoutes({
  tag: "Countries",
  resourceName: "country",
  createSchema: createCountrySchema,
  updateSchema: updateCountrySchema,
  responseSchema: countryResponseSchema,
});

export function registerCountryRoutes(app: OpenAPIHono) {
  const country = new OpenAPIHono();

  country.use("*", requireAuth);

  country.openapi(routes.list, async (c) => {
    const data = await countriesController.list();
    return c.json(data, 200);
  });

  country.openapi(routes.getById, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const data = await countriesController.getById(id);
    if (!data) return c.json({ error: "Not found" }, 404);
    return c.json(data, 200);
  });

  country.openapi(routes.create, async (c) => {
    const body = c.req.valid("json") as CreateCountry;
    const data = await countriesController.create(body);
    return c.json(data, 201);
  });

  country.openapi(routes.update, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    const body = c.req.valid("json") as UpdateCountry;
    const data = await countriesController.update(id, body);
    return c.json(data, 200);
  });

  country.openapi(routes.remove, async (c) => {
    const id = parseId(c.req.param("id"));
    if (id === null) return c.json({ error: "Invalid ID" }, 400);
    await countriesController.remove(id);
    return c.json({ success: true }, 200);
  });

  app.route("/country", country);
}
