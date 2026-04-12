# CI/CD

All CI runs on GitHub Actions. Workflows are defined in `.github/workflows/`.

## Workflows Overview

| File                    | Trigger                   | Purpose                                                 |
| ----------------------- | ------------------------- | ------------------------------------------------------- |
| `pr-checks.yml`         | PRs to main (non-draft)   | Runs CI tests with change detection and coverage upload |
| `pr-validation.yml`     | PRs to main               | Validates PR title and checks formatting                |
| `pr-report.yml`         | After PR Checks complete  | Posts coverage and Playwright summaries as PR comments  |
| `pr-labeler.yml`        | Push to main / PR opened  | Auto-labels PRs, maintains release draft                |
| `ci-tests.yml`          | Called by other workflows | Reusable test suite (all test and validation jobs)      |
| `smoketest-android.yml` | Called by other workflows | Android E2E smoke tests on emulator                     |
| `renovate.yml`          | Every 2 hours             | Automated dependency updates via Renovate               |
| `release.yml`           | Version tags (`v*.*.*`)   | Full release pipeline                                   |

All jobs use Node.js 24.14.1 via the shared `.github/actions/setup-node` composite action.

## PR Checks

Three workflows fire on every non-draft PR targeting `main`:

**`pr-validation.yml`** (runs on open/edit/synchronize/reopen):

- **check-title** — validates semantic PR title (`feat`, `fix`, `refactor`, `chore`, `docs`, `deps`)
- **prettier** — checks formatting with `pnpm prettier --check "**/*.{ts,tsx,md}"`

**`pr-checks.yml`** (runs on open/synchronize/reopen/ready-for-review):

- Delegates to `ci-tests.yml` with `detect-changes: true` and `upload-coverage: true`

**`pr-report.yml`** (runs after PR Checks complete):

- Downloads coverage artifacts and posts per-package Vitest coverage summaries as a PR comment
- Downloads Playwright results and posts an E2E test summary comment

## CI Tests (`ci-tests.yml`)

Reusable workflow called by both `pr-checks.yml` and `release.yml`. Change detection (`dorny/paths-filter`) skips jobs when relevant files haven't changed.

### Change detection paths

| Filter      | Paths                                                               |
| ----------- | ------------------------------------------------------------------- |
| `web`       | `apps/web/**`                                                       |
| `backend`   | `apps/backend/**`                                                   |
| `mobile`    | `apps/mobile/**`                                                    |
| `packages`  | `packages/validators/**`, `packages/types/**`, `packages/common/**` |
| `structure` | `package.json`, `pnpm-lock.yaml`, `.github/workflows/**`            |

### Jobs

| Job                      | Runs when                               | What it does                                                                    |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------------------------- |
| **test-web-functions**   | web, packages, or structure changed     | Builds frontend, runs Vitest unit tests                                         |
| **test-validators**      | packages or structure changed           | Runs validator Vitest tests                                                     |
| **test-common**          | packages or structure changed           | Runs common package Vitest tests                                                |
| **test-backend**         | backend, packages, or structure changed | Builds backend, runs Vitest tests across SQLite, PostgreSQL, and MySQL (matrix) |
| **test-mobile**          | mobile, packages, or structure changed  | Runs mobile Vitest tests                                                        |
| **test-web-e2e**         | web, packages, or structure changed     | Runs Playwright E2E tests on Chromium                                           |
| **validate-expo**        | mobile or structure changed             | Runs `expo-doctor` and `expo install --check`                                   |
| **validate-api-docs**    | backend, packages, or structure changed | Validates API doc generation                                                    |
| **validate-web-docs**    | web or packages changed                 | Builds VitePress web docs (no screenshots)                                      |
| **validate-mobile-docs** | mobile or packages changed              | Builds VitePress mobile docs (no screenshots)                                   |

### Backend database matrix

The `test-backend` job uses a strategy matrix to run the full test suite against all three supported database engines in parallel.

PostgreSQL and MySQL run as GitHub Actions service containers with health checks. Tests for these engines use `--no-file-parallelism` since they share a single database instance, with table data cleaned between suites.

When called with `upload-coverage: true`, each test job runs `test:coverage` and uploads a coverage artifact (retained 1 day) for `pr-report.yml` to consume. Backend coverage artifacts are named per-engine (e.g. `coverage-backend-sqlite`, `coverage-backend-postgres`).

## Android Smoke Tests (`smoketest-android.yml`)

Reusable workflow (also triggerable manually). Runs on every release as a gate before doc builds and Docker pushes.

1. Sets up Java 17, Android SDK, and creates an API 31 AVD (cached)
2. Caches Expo prebuild output and Gradle dependencies
3. Builds a release APK (`assembleRelease`)
4. Installs Maestro, starts the mock server
5. Runs smoke tests from `apps/mobile/e2e/smoke/` against the emulator
6. Uploads Maestro debug output as an artifact (retained 7 days)

## Release (`release.yml`)

Triggered by version tags (`v*.*.*`). Gate jobs run in parallel; downstream jobs wait on all gates.

### Release jobs

| Job                        | Depends on                                     | What it does                                                                     |
| -------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| **prettier**               | —                                              | Formatting check                                                                 |
| **tests**                  | —                                              | Calls `ci-tests.yml` (no change detection, no coverage upload)                   |
| **smoketest-android**      | —                                              | Calls `smoketest-android.yml`                                                    |
| **build-api-docs**         | gates                                          | Generates API docs with version stamp, uploads artifact                          |
| **build-webui-user-docs**  | gates                                          | Takes Playwright screenshots, builds VitePress docs, uploads artifact            |
| **build-mobile-user-docs** | gates                                          | Builds Android APK, takes Maestro screenshots on emulator, builds VitePress docs |
| **deploy-docs**            | doc builds                                     | Assembles `/api`, `/web`, `/mobile` under `_site/`, deploys to GitHub Pages      |
| **docker-frontend**        | gates                                          | Builds and pushes `ghcr.io/.../cellarboss-web` with semver tags                  |
| **docker-backend**         | gates                                          | Builds and pushes `ghcr.io/.../cellarboss-backend` with semver tags              |
| **build-android**          | gates                                          | Builds signed AAB using keystore secrets                                         |
| **deploy-android**         | build-android                                  | Uploads AAB to Google Play internal testing track (draft status)                 |
| **create-release**         | docker-frontend, docker-backend, build-android | Publishes GitHub release via release-drafter, attaches versioned AAB             |

## Dependency Updates (Renovate)

`renovate.yml` runs automatically using the Renovate GitHub Action with config from `.github/renovate.json`.

## Dependency Updates (Expo)

`expo-update.yml` runs automatically and checks for any Expo updates with `expo install --fix`.
Any updates are then rolled into a PR, which should be automatically integrated.

## Running Tests Locally

```bash
# Backend
cd apps/backend && pnpm test

# Validators
cd packages/validators && pnpm test

# Common
cd packages/common && pnpm test

# Mobile unit tests
cd apps/mobile && pnpm test

# Web unit tests
cd apps/web && pnpm test

# Web E2E tests
cd apps/web && pnpm test:e2e
```

## Formatting Check

CI runs Prettier across the entire repo. To check locally before pushing:

```bash
pnpm prettier --check "**/*.{ts,tsx,md}"
```
