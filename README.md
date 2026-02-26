# CellarBoss

An open-source wine cellar inventory manager. Track your collection by country, region, grape variety, winemaker, and vintage. Manage physical storage locations and monitor bottle inventory.

## Features

- Wine database with detailed attributes (country, region, grape, winemaker, vintage)
- Bottle inventory with per-bottle storage location tracking
- Drinking window tracking per vintage
- User accounts with admin and standard roles

## Roadmap

- Multi-database support. Currently limited to Sqlite, with MySQL and Postgres in the works
- Tasting notes / ratings
- Upload images of your collection
- Import wine details from 3rd party websites (Vivino, Wine Society, Naked Wines etc)
- User & technical documentation

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

There are separate test suites for individual parts of the project. Currently, all of these are automatically run whenever a PR is raised for a merge into the main branch.

### Backend

`vitest` for all API routes

```bash
cd apps/backend
pnpm test
```

### Validators

`vitest` for all validation rules

```bash
cd packages/validators
pnpm test
```

### Web UI - functional tests

`vitest` for helper functions

```bash
cd apps/web
pnpm test
```

### Web UI - end-to-end testing

`playwright` end-to-end tests for user activities, with a mock backend API

```bash
cd apps/web
pnpm test:e2e
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

| Value      | Driver         |
| ---------- | -------------- |
| `sqlite`   | better-sqlite3 |
| `postgres` | pg             |
| `mysql`    | mysql2         |

Set `DATABASE_URL` to the appropriate connection string (or file path for SQLite).

## FAQs

### Has this project been 'vibe coded'?!

I ([mattdy](https://github.com/mattdy)) created this project to fufil a need in my own life, and decided to release it publically in case others find it useful.
While I do have a background in software development, I am by no means an expert in React development.
As such, I have made use of LLMs such as [ChatGPT](https://openai.com/chatgpt/), [Claude](https://claude.ai/) and [Copilot](https://github.com/features/copilot) to aid development.

I wouldn't go as far as calling this project 'vibe-coded', but certain elements have been written by AI models, and I will likely continue to utilise these within the project.
This will possibly involve future features also being written by AI, but I am also considering automatic PR reviews and the like.

I am very happy to enter into a discussion on the merits of these, respecting my position the current sole developer on the project.

### Can I use this commercially?

It is my intention to make this software free and available for community non-profit usage, without restriction.
That said, I may choose to investigate commercial licencing arrangements in the future, should there be any demand for such support.
In the meantime, if you wish to use this software in a commercial setting, then please consider [giving back](https://buymeacoffee.com/mattdyson) to the project.

### You could use a better design/logo

Good observation! I'm terrible at graphic design, please [get in touch](https://github.com/CellarBoss/cellarboss/issue) if you can help with the styling!

### Can you add X feature?

Any feedback or suggestions are gratefully received via [Issues](https://github.com/CellarBoss/cellarboss/issues)

### I found a bug!

Great! As above, please raise an [Issue](https://github.com/CellarBoss/cellarboss/issues)

## License

See [license information](LICENSE)
