# Web Frontend (`apps/web`)

## Tech Stack

| Category      | Technology                                          |
| ------------- | --------------------------------------------------- |
| Framework     | Next.js 16 (App Router, standalone output)          |
| Language      | TypeScript 5.9 (strict mode)                        |
| UI            | React 19, Radix UI, Lucide icons                    |
| Styling       | Tailwind CSS 4 with PostCSS                         |
| Data Fetching | TanStack React Query v5                             |
| Tables        | TanStack React Table v8                             |
| Forms         | TanStack React Form                                 |
| URL State     | nuqs v2                                             |
| Validation    | Zod                                                 |
| Auth          | Better Auth                                         |
| Linting       | ESLint (flat config, Next.js core-web-vitals rules) |
| Formatting    | Prettier                                            |
| Unit Testing  | Vitest                                              |
| E2E Testing   | Playwright                                          |

## Environment

```
CELLARBOSS_SERVER=http://localhost:5000
BETTER_AUTH_SECRET=<super-secret-code-that-must-be-the-same-elsewhere>
BETTER_AUTH_URL=http://localhost:5000
```

## Scripts

| Script                 | Description                                  |
| ---------------------- | -------------------------------------------- |
| `pnpm dev`             | Start Next.js dev server (port 3000)         |
| `pnpm build`           | Production build                             |
| `pnpm start`           | Start production server                      |
| `pnpm test`            | Run Vitest unit tests                        |
| `pnpm test:coverage`   | Run unit tests with v8 coverage              |
| `pnpm test:watch`      | Run unit tests in watch mode                 |
| `pnpm test:e2e`        | Run Playwright E2E tests                     |
| `pnpm test:e2e:ui`     | Run E2E tests with interactive Playwright UI |
| `pnpm test:e2e:headed` | Run E2E tests in headed browser mode         |
| `pnpm lint`            | Run ESLint                                   |
| `pnpm format`          | Format code with Prettier                    |

## Project Structure

```
apps/web/
├── app/              # Next.js App Router pages
├── components/       # React components
├── hooks/            # Custom React hooks
├── lib/
│   ├── api/          # API client (makeRequest, ApiResult<T>)
│   ├── functions/    # Utility functions (with unit tests)
│   ├── fields/       # Form field definitions
│   ├── constants/    # Application constants
│   ├── types/        # Frontend-specific TypeScript types
│   ├── auth-client.ts
│   └── utils.ts
├── e2e/              # Playwright E2E tests (see below)
├── docs/             # VitePress user documentation
└── public/           # Static assets
```

## Unit Testing

Unit tests use Vitest and live alongside the code they test (e.g. `lib/functions/__tests__/`).

```bash
pnpm test             # run once
pnpm test:coverage    # with coverage report
pnpm test:watch       # watch mode
```

**Configuration** (`vitest.config.ts`):

- Test files: `lib/**/*.test.{ts,tsx}`, `hooks/**/*.test.ts`
- Environment: Node.js
- JSX: esbuild with `jsx: "automatic"` (note: this is esbuild's name, not TypeScript's `react-jsx`)
- Coverage: v8 provider, excludes `lib/api/` and test files
- Path alias: `@` maps to the project root

## E2E Testing

End-to-end tests use Playwright with a Hono-based mock API server.

```bash
pnpm test:e2e          # headless
pnpm test:e2e:ui       # interactive Playwright UI
pnpm test:e2e:headed   # visible browser
```

### How it works

1. **Global setup** starts a mock Hono server on port 5173
2. **Playwright** builds and starts Next.js on port 3000, pointed at the mock via `CELLARBOSS_SERVER=http://localhost:5173`
3. Tests run sequentially (single worker) against Chromium
4. **Global teardown** stops the mock server

### Mock Server (`packages/mock-server/`)

A Hono app that simulates the backend API. It provides control endpoints for test setup:

| Endpoint                   | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `POST /__test/set-session` | Set the mock auth session (admin or user)   |
| `POST /__test/set-state`   | Merge partial state into mock data          |
| `POST /__test/reset`       | Reset mock data to defaults (keeps session) |
| `GET /__test/state`        | Read the current mock data                  |

The default data (`packages/mock-server/src/defaults.ts`) is a small working cellar, so tests that don't need specific data can run against it without seeding.

### Auth in Tests

The proxy only checks for the presence of a `better-auth.session_token` cookie. Test fixtures (`e2e/fixtures/auth.ts`) provide:

- `adminPage` / `userPage` — pages signed in as an admin or a regular user
- `adminContext` / `userContext` — the browser contexts behind them
- `setState(partial)` / `getState()` — seed and inspect mock data

Mock data is reset automatically after every test, so specs don't need their own `afterEach`.

`e2e/fixtures/form.ts` has helpers for the shared `GenericCard` forms: `fieldCombobox`, `chooseOption` and `saveForm`.

### Test Files

Tests live in `e2e/tests/`. Alongside page-specific specs, `resources.spec.ts` runs the same create/edit/delete tests over every name-only resource (countries, grapes, locations, winemakers), `forms.spec.ts` covers saving the richer forms, and `details.spec.ts` covers the detail pages. Tests that change data should check the result with `getState()` as well as on screen.

### Playwright Configuration

- Sequential execution (1 worker, not fully parallel)
- Retries: 1 in CI, 0 locally
- Traces captured on first retry
- Screenshots only on failure
- HTML, JSON, and list reporters

## Linting

ESLint uses the new flat config format (`eslint.config.mjs`) with `next/core-web-vitals` and `next/typescript` rule sets.

```bash
pnpm lint
```
