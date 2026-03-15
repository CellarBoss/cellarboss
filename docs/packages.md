# Shared Packages

The monorepo contains two shared packages consumed by both `apps/backend` and `apps/web`.

## `@cellarboss/types` (`packages/types`)

Pure TypeScript type definitions for all domain entities. There is no build step — consumers import directly from source.

### What it exports

Type triplets for each domain entity (base, Create, Update variants):

- Bottle, Country, Grape, Location, Region, Storage, Vintage, Wine, WineGrape, Winemaker, Setting, TastingNote
- Generic utility types

### Scripts

| Script        | Description          |
| ------------- | -------------------- |
| `pnpm format` | Format with Prettier |

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
| `pnpm format`        | Format with Prettier       |

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
