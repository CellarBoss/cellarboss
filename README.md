# Cellarboss

An open-source wine cellar inventory manager. Track your collection by country, region, grape variety, winemaker, and vintage. Manage physical storage locations and monitor bottle inventory.

## Features

- Wine database with detailed attributes (country, region, grape, winemaker, vintage)
- Bottle inventory with per-bottle storage location tracking
- Drinking window tracking per vintage
- User accounts with admin and standard roles

## Future features

- Multi-database support. Currently limited to Sqlite, with MySQL and Postgres in the works
- Tasting notes / ratings
- Upload images of your collection
- Import wine details from 3rd party websites (Vivino, Wine Society, Naked Wines etc)

## Tech Stack

**Frontend** — Next.js 16, React 19, Tailwind CSS 4, TanStack Query v5, TanStack Form, Radix UI, Better Auth

**Backend** — Node.js 20, Hono, Kysely, Better Auth, Zod, Vitest

## Project Structure

```
cellarboss/
├── apps/
│   ├── backend/      # Hono API server
│   └── web/          # Next.js frontend
├── assets/           # Coming soon...
├── docs/             # Coming soon...
└── packages/
    ├── types/        # Shared type definitions
    └── validators/   # Shared Zod validators
```

## Getting Started

### Prerequisites

- Node.js 20
- pnpm 9

### Install dependencies

```bash
pnpm install
```

### Configure environment

**Backend** (`apps/backend/.env`):
```
BETTER_AUTH_SECRET=<random-secret>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_TYPE=sqlite
DATABASE_URL=database.sqlite
NODE_ENV=development
```

**Frontend** (`apps/web/.env`):
```
CELLARBOSS_SERVER=http://localhost:5000
BETTER_AUTH_SECRET=<same-secret-as-backend>
NODE_ENV=development
```

### Run migrations

```bash
cd apps/backend
pnpm auth:migrate
pnpm migrate
```

Optionally seed some initial data:

```bash
pnpm seed
```

### Start the dev servers

```bash
# Backend (port 5000)
pnpm --filter backend dev

# Frontend (port 3000)
pnpm --filter web dev
```

### Docker Compose

A `docker-compose.dev.yml` is provided for running the full stack locally with PostgreSQL:

```bash
docker-compose -f docker-compose.dev.yml up
```

This starts PostgreSQL on port 5432, the backend on port 5000, and the frontend on port 3000.

## Testing

Tests are in the backend only (frontend has no test suite yet). They run against an in-memory SQLite database.

```bash
cd apps/backend
pnpm test
```

## Building

```bash
# Build everything
pnpm build

# Or individually
pnpm --filter backend build
pnpm --filter web build
```

## Database Support

The backend uses Kysely with dialect switching based on the `DATABASE_TYPE` environment variable:

| Value | Driver |
|-------|--------|
| `sqlite` | better-sqlite3 |
| `postgres` | pg |
| `mysql` | mysql2 |

Set `DATABASE_URL` to the appropriate connection string (or file path for SQLite).

## License

MIT
