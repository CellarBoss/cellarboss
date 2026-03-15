# Backend (`apps/backend`)

## Tech Stack

| Category       | Technology                                  |
| -------------- | ------------------------------------------- |
| Runtime        | Node.js 20+                                 |
| Framework      | Hono with `@hono/node-server`               |
| Language       | TypeScript 5.9 (strict mode, ESNext target) |
| Build          | tsup (ESM output)                           |
| Database       | Kysely (SQLite, PostgreSQL, MySQL)          |
| Authentication | Better Auth with admin plugin               |
| Validation     | Zod + `@hono/zod-validator`                 |
| API Docs       | `@hono/zod-openapi` + Scalar UI             |
| Testing        | Vitest                                      |

## Environment

```
BETTER_AUTH_SECRET=<super-secret-code-that-must-be-the-same-elsewhere>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_TYPE=sqlite
DATABASE_URL=database.sqlite
NODE_ENV=development
```

## Scripts

| Script               | Description                                    |
| -------------------- | ---------------------------------------------- |
| `pnpm dev`           | Start dev server with hot-reload (`tsx watch`) |
| `pnpm build`         | Build with tsup                                |
| `pnpm start`         | Run the built server                           |
| `pnpm test`          | Run Vitest tests                               |
| `pnpm test:coverage` | Run tests with v8 coverage report              |
| `pnpm test:ui`       | Open Vitest interactive UI                     |
| `pnpm auth:migrate`  | Run Better Auth migrations                     |
| `pnpm migrate`       | Run Kysely migrations to latest                |
| `pnpm migrate:down`  | Revert the last Kysely migration               |
| `pnpm seed`          | Seed the database with initial data            |
| `pnpm format`        | Format code with Prettier                      |
| `pnpm generate:docs` | Generate API documentation                     |

## Architecture

```
src/
├── index.ts           # Entry point — creates Hono app, registers routes
├── controllers/       # Business logic (CRUD operations per entity)
├── routes/            # API route definitions with OpenAPI schemas
├── middleware/         # auth.ts, admin.ts, error.ts
├── schema/            # Kysely database table interfaces
├── openapi/           # OpenAPI helper utilities
├── utils/             # Database, auth, env, migration, startup utilities
├── migrations/        # Kysely migrations (001–013)
├── seeds/             # Database seeders
└── tests/             # Vitest test suites + setup helpers
```

### API Design

The API is OpenAPI-first, using `@hono/zod-openapi` for spec generation. CRUD routes are created via a `createCrudRoutes()` helper. The OpenAPI spec is served at `/api/openapi.json` and a Scalar UI at `/api/docs`.

### Middleware

- `requireAuth` — checks the session via Better Auth
- `requireAdmin` — checks the user has the `admin` role
- Error handler — maps Kysely errors and constraint violations to HTTP responses

## Database Support (coming soon)

The backend uses Kysely with dialect switching based on the `DATABASE_TYPE` environment variable:

| Value      | Driver         |
| ---------- | -------------- |
| `sqlite`   | better-sqlite3 |
| `postgres` | pg             |
| `mysql`    | mysql2         |

Set `DATABASE_URL` to the appropriate connection string (or file path for SQLite).

### Migrations

There are 13 Kysely migrations (`001_create_countries` through `013_create_tasting_notes`). Each has `up()` and `down()` functions.

Migrations are run with:

```bash
pnpm migrate        # apply all pending
pnpm migrate:down   # revert last
```

Better Auth has its own migration step that must be run separately:

```bash
pnpm auth:migrate
```

### Seeding

Five seed files create initial data: an admin user, countries, grapes, regions, and default settings.

```bash
pnpm seed
```

## Testing

Tests use Vitest with an in-memory SQLite database. Auth is mocked via `vi.spyOn(auth.api, "getSession")`.

```bash
pnpm test             # run all tests
pnpm test:coverage    # run with coverage
pnpm test:ui          # interactive UI
```

Test setup (`src/tests/setup.ts`) provides:

- Migration runner that initialises a fresh database per suite
- Mock session creation helpers
- Test app factories (authenticated/unauthenticated Hono instances)
- Fixture helpers for creating test data (countries, regions, wines, etc.)
