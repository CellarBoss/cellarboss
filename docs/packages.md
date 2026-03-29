# Shared Packages

The monorepo contains four shared packages consumed by `apps/backend`, `apps/web`, and/or `apps/mobile`.

## `@cellarboss/types` (`packages/types`)

Pure TypeScript type definitions for all domain entities. There is no build step — consumers import directly from source.

### What it exports

Type triplets for each domain entity (base, Create, Update variants):

- Bottle, Country, Grape, Location, Region, Storage, Vintage, Wine, WineGrape, Winemaker, Setting, TastingNote
- Generic utility types

### Scripts

None — types-only package with no build or test step.

## `@cellarboss/validators` (`packages/validators`)

Zod validation schemas for all domain entities, plus shared constants (`BottleStatus`, `WineType`).

### What it exports

- Zod schemas matching each type from `@cellarboss/types`
- `BottleStatus` and `WineType` discriminated unions (from `constants.ts`)

### Scripts

| Script               | Description                |
| -------------------- | -------------------------- |
| `pnpm test`          | Run Vitest tests           |
| `pnpm test:coverage` | Run tests with v8 coverage |
| `pnpm test:watch`    | Run tests in watch mode    |

### Testing

Uses Vitest with Node environment. Tests live in `src/__tests__/` with one test file per validator module.

```bash
pnpm test
```

### Configuration

- Module: ESM
- Zod: v4
- TypeScript: 5.9 (strict mode)
- Coverage: v8 provider with text, JSON summary, and JSON reporters

## `@cellarboss/common` (`packages/common`)

Shared runtime logic consumed by both `apps/web` and `apps/mobile`. Depends on `@cellarboss/types` and `@cellarboss/validators`.

### What it exports

- **API client** — `createApiClient`, `ApiClient`, `ApiClientConfig`, `ApiResult`, `ApiQueryError`, `RequestFn`
- **Error handling** — `processBackendError`
- **Constants** — Labels for resources, will eventually be replaced by i18n
- **Format functions** — Formatting of size/colour/text for resources
- **Settings** — Parse global application settings
- **Hooks** (React) — `useApiQuery`, `createSettingsHooks`
- **Query gate** — Used in conjunction with `API Client` to provide a single 'loading' or 'error' interface
- **User types** — `AdminUser`, `UserFormData`
- **Resource modules** (subpath exports) — per-entity API functions for all domain resources

### Scripts

| Script               | Description                |
| -------------------- | -------------------------- |
| `pnpm test`          | Run Vitest tests           |
| `pnpm test:coverage` | Run tests with v8 coverage |
| `pnpm test:watch`    | Run tests in watch mode    |

### Testing

Uses Vitest. Tests live in `src/__tests__/` with subdirectories for `api-client/` tests (one per resource) plus standalone tests for errors, format, query-gate, and settings.

### Configuration

- Module: ESM
- TypeScript: 5.9 (strict mode)
- Peer dependencies: React ≥18, TanStack Query ≥5
- Coverage: v8 provider

## `@cellarboss/mock-server` (`packages/mock-server`)

Hono-based HTTP server used in Playwright E2E tests to simulate the backend API. Maintains in-memory state for all domain resources.

### What it exports

- `startMockServer(port)` — starts the server, resets state to defaults, returns a `ServerType` promise
- `stopMockServer()` — shuts down the server
- `getMockState()` — returns the current `MockState` for assertions
- `MockState` and `SessionPayload` types

### Control endpoints

Used by tests to configure server state without going through the normal API:

| Endpoint              | Method | Description                              |
| --------------------- | ------ | ---------------------------------------- |
| `/__test/healthcheck` | GET    | Returns `{ ok: true }`                   |
| `/__test/set-session` | POST   | Sets the active session payload          |
| `/__test/set-state`   | POST   | Merges a partial object into state       |
| `/__test/reset`       | POST   | Resets state to defaults (keeps session) |

### Scripts

| Script       | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `pnpm start` | Start the mock server standalone (default port 5174, override with `MOCK_SERVER_PORT`) |

### Configuration

- Module: ESM
- Framework: Hono + `@hono/node-server`
- TypeScript: 5.9
