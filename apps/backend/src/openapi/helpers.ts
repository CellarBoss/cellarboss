import { createRoute, type z } from "@hono/zod-openapi";
import type { ZodType } from "zod";
import { errorSchema, idParamSchema, successSchema } from "./schemas.js";

const authSecurity = [{ cookieAuth: [] }];
const adminSecurity = [{ cookieAuth: [] }];

interface CrudRouteConfig {
  tag: string;
  resourceName: string;
  createSchema: ZodType;
  updateSchema: ZodType;
  responseSchema: ZodType;
  security?: typeof authSecurity;
}

function jsonContent(schema: ZodType, description: string) {
  return {
    content: { "application/json": { schema } },
    description,
  };
}

export function createCrudRoutes(config: CrudRouteConfig) {
  const {
    tag,
    resourceName,
    createSchema,
    updateSchema,
    responseSchema,
    security = authSecurity,
  } = config;

  const list = createRoute({
    method: "get",
    path: "/",
    tags: [tag],
    security,
    summary: `List all ${resourceName}s`,
    responses: {
      200: jsonContent(
        (responseSchema as any).array(),
        `List of ${resourceName}s`,
      ),
      401: jsonContent(errorSchema, "Unauthorized"),
    },
  });

  const getById = createRoute({
    method: "get",
    path: "/{id}",
    tags: [tag],
    security,
    summary: `Get a ${resourceName} by ID`,
    request: { params: idParamSchema },
    responses: {
      200: jsonContent(responseSchema, `The ${resourceName}`),
      400: jsonContent(errorSchema, "Invalid ID"),
      401: jsonContent(errorSchema, "Unauthorized"),
      404: jsonContent(errorSchema, "Not found"),
    },
  });

  const create = createRoute({
    method: "post",
    path: "/",
    tags: [tag],
    security,
    summary: `Create a ${resourceName}`,
    request: {
      body: jsonContent(createSchema, `${resourceName} data`),
    },
    responses: {
      201: jsonContent(responseSchema, `The created ${resourceName}`),
      401: jsonContent(errorSchema, "Unauthorized"),
      422: jsonContent(errorSchema, "Validation error"),
    },
  });

  const update = createRoute({
    method: "put",
    path: "/{id}",
    tags: [tag],
    security,
    summary: `Update a ${resourceName}`,
    request: {
      params: idParamSchema,
      body: jsonContent(updateSchema, `Fields to update`),
    },
    responses: {
      200: jsonContent(responseSchema, `The updated ${resourceName}`),
      400: jsonContent(errorSchema, "Invalid ID"),
      401: jsonContent(errorSchema, "Unauthorized"),
      422: jsonContent(errorSchema, "Validation error"),
    },
  });

  const remove = createRoute({
    method: "delete",
    path: "/{id}",
    tags: [tag],
    security,
    summary: `Delete a ${resourceName}`,
    request: { params: idParamSchema },
    responses: {
      200: jsonContent(successSchema, "Successfully deleted"),
      400: jsonContent(errorSchema, "Invalid ID"),
      401: jsonContent(errorSchema, "Unauthorized"),
    },
  });

  return { list, getById, create, update, remove };
}

export { jsonContent, authSecurity, adminSecurity };
