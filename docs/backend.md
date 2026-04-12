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
UPLOAD_DIR=/path/to/uploads
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
├── middleware/        # auth.ts, admin.ts, error.ts
├── schema/            # Kysely database table interfaces
├── openapi/           # OpenAPI helper utilities
├── utils/             # Database, auth, env, migration, startup utilities
├── migrations/        # Kysely migrations
├── seeds/             # Database seeders
└── tests/             # Vitest test suites + setup helpers
```

### API Design

The API is OpenAPI-first, using `@hono/zod-openapi` for spec generation. CRUD routes are created via a `createCrudRoutes()` helper. The OpenAPI spec is served at `/api/openapi.json` and a Scalar UI at `/api/docs`.

### Middleware

- `requireAuth` — checks the session via Better Auth
- `requireAdmin` — checks the user has the `admin` role
- Error handler — maps Kysely errors and constraint violations to HTTP responses

## Database Support

The backend supports three database engines via Kysely with dialect switching based on the `DATABASE_TYPE` environment variable:

| Value      | Driver         | Connection string example                          |
| ---------- | -------------- | -------------------------------------------------- |
| `sqlite`   | better-sqlite3 | `database.sqlite` (file path) or `:memory:`        |
| `postgres` | pg             | `postgresql://user:pass@localhost:5432/cellarboss` |
| `mysql`    | mysql2         | `mysql://user:pass@localhost:3306/cellarboss`      |

Set `DATABASE_URL` to the appropriate connection string (or file path for SQLite).

### Database-agnostic helpers

Because SQLite, PostgreSQL, and MySQL differ in type syntax and query capabilities, two utility modules abstract the differences:

**Migration helpers** (`src/utils/migration-helpers.ts`) — dialect-aware column type functions used in migrations:

| Helper        | SQLite                              | PostgreSQL           | MySQL                                |
| ------------- | ----------------------------------- | -------------------- | ------------------------------------ |
| `addIdColumn` | `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` | `INTEGER AUTO_INCREMENT PRIMARY KEY` |
| `shortText`   | `text`                              | `text`               | `varchar(255)`                       |
| `longText`    | `text`                              | `text`               | `text`                               |
| `boolean`     | `integer`                           | `boolean`            | `tinyint(1)`                         |
| `decimal`     | `numeric(12,2)`                     | `numeric(12,2)`      | `numeric(12,2)`                      |
| `timestamp`   | `text`                              | `timestamptz`        | `datetime(3)`                        |
| `json`        | `text`                              | `jsonb`              | `json`                               |

**Query helpers** (`src/utils/query-helpers.ts`) — runtime coercion and insert/update abstractions:

| Function             | Purpose                                                                                |
| -------------------- | -------------------------------------------------------------------------------------- |
| `toBool(value)`      | Coerce boolean columns (PG returns `boolean`, MySQL/SQLite return `0/1`)               |
| `toNumber(value)`    | Coerce decimal columns (PG/MySQL return strings, SQLite returns numbers)               |
| `toISOString(value)` | Coerce timestamp columns (PG/MySQL return `Date`, SQLite returns strings)              |
| `insertReturning`    | Insert + return full row (uses `RETURNING` on SQLite/PG, `insertId` + select on MySQL) |
| `updateReturning`    | Update + return full row (uses `RETURNING` on SQLite/PG, select-after-update on MySQL) |

### Migrations

Each Kysely migration has `up()` and `down()` functions. All migrations use the migration helpers above for cross-database compatibility.

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

Tests use Vitest and run against all three database engines in CI. Locally, tests default to whichever engine is configured via `DATABASE_TYPE` / `DATABASE_URL` environment variables (SQLite `:memory:` if unset). Auth is mocked via `vi.spyOn(auth.api, "getSession")`.

For PostgreSQL and MySQL, tests run with `--no-file-parallelism` since they use a shared database instance. A `cleanDatabase` helper truncates all tables between test suites to ensure isolation.

```bash
pnpm test             # run all tests
pnpm test:coverage    # run with coverage
pnpm test:ui          # interactive UI
```

Test setup (`src/tests/setup.ts`) provides:

- Migration runner that initialises a fresh database per suite
- `cleanDatabase` helper that truncates all tables in FK-safe order
- Mock session creation helpers
- Test app factories (authenticated/unauthenticated Hono instances)
- Fixture helpers for creating test data (countries, regions, wines, etc.)
