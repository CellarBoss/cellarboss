# CI/CD

All CI runs on GitHub Actions. Workflows are defined in `.github/workflows/`, shared steps in `.github/actions/`.

## Workflows Overview

Files prefixed with `_` are reusable workflows (`workflow_call`), called by the entry-point workflows. The two smoke-test workflows can also be run manually from the Actions tab.

| File                 | Trigger                            | Purpose                                                     |
| -------------------- | ---------------------------------- | ----------------------------------------------------------- |
| `pr.yml`             | PRs to main                        | Lint + tests behind a single required check (`PR Required`) |
| `pr-title.yml`       | PRs to main (incl. edited)         | Validates the semantic PR title                             |
| `pr-report.yml`      | After PR Checks complete           | Posts coverage and Playwright summaries on the PR           |
| `pr-labeler.yml`     | Push to main / PR opened or edited | Auto-labels PRs, maintains the release draft                |
| `release.yml`        | Version tags (`v*.*.*`)            | Full release pipeline                                       |
| `renovate.yml`       | Every 2 hours                      | Automated dependency updates via Renovate                   |
| `expo-update.yml`    | Every 12 hours                     | Syncs Expo SDK dependency versions                          |
| `_lint.yml`          | Called by other workflows          | Prettier formatting check and zizmor workflow security scan |
| `_tests.yml`         | Called by other workflows          | Reusable test suite (all test and validation jobs)          |
| `_smoke-android.yml` | Called / manual dispatch           | Android E2E smoke tests on an emulator                      |
| `_smoke-docker.yml`  | Called / manual dispatch           | Builds and runs each Docker image on amd64 and arm64        |

## Composite Actions

| Action                 | What it does                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `setup-node`           | pnpm + Node.js 24.21.0, `pnpm install --frozen-lockfile`                                                                                   |
| `setup-playwright`     | Caches and installs Playwright Chromium and its system dependencies                                                                        |
| `setup-android`        | Java 17, Android SDK, Expo prebuild (cached unless `prebuild-cache: false`), Gradle cache. `native-project: false` sets up only Java + SDK |
| `run-android-emulator` | API 31 AVD (cached), KVM, Maestro; boots the emulator, installs an APK, then runs the given `script`                                       |
| `start-mock-server`    | Starts `@cellarboss/mock-server` in the background and waits for its health check                                                          |

Workflows reference local actions and reusable workflows as `$/.github/...`, which GitHub resolves to this repository at the triggering commit.

## Conventions

- Top-level `permissions` are read-only (or `{}`); jobs that need more elevate their own, with a comment saying why.
- Every entry-point workflow sets `concurrency`. PR workflows cancel superseded runs; release, Renovate and Expo update queue instead. Reusable workflows don't set it: the group would resolve in the caller's context and could cancel the caller.
- Every job that runs steps sets `timeout-minutes`. Jobs that call a reusable workflow can't; the jobs inside it carry their own.
- Secrets reach scripts only through `env:`, never as `${{ }}` inside `run:`.
- Tool versions not managed by an action (Maestro, expo-doctor) are pinned in a `*_VERSION` env var with a `# renovate:` comment, picked up by Renovate's `customManagers:githubActionsVersions` preset.

## PR Checks (`pr.yml`)

Runs on open/synchronize/reopen/ready-for-review. Superseded runs for the same PR are cancelled.

| Job             | What it does                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- |
| **lint**        | Calls `_lint.yml`. Runs on drafts too                                                         |
| **tests**       | Calls `_tests.yml` with `detect-changes: true` and `upload-coverage: true`. Skipped on drafts |
| **pr-required** | `PR Required` — the check to require in branch protection. Fails if lint or tests failed      |

A reusable workflow call fails if any job inside it fails, and jobs skipped by change detection count as success, so `PR Required` only needs to look at the two calls.

`pr-title.yml` stays separate because it must also run on `edited` (title changes) without re-running the whole suite. Require `Validate PR Title` alongside `PR Required`.

**`pr-report.yml`** (runs after PR Checks complete, via `workflow_run`):

- Downloads coverage artifacts and posts per-package Vitest coverage summaries
- Downloads Playwright results and posts an E2E test summary comment

## Lint (`_lint.yml`)

- **prettier** — `pnpm prettier --check "**/*.{ts,tsx,md}"`
- **zizmor** — workflow security scan using `.github/zizmor.yml`. Callers must grant `security-events: write` for the SARIF upload.

## Tests (`_tests.yml`)

Reusable workflow called by `pr.yml` and `release.yml`; callers must grant `pull-requests: read` for change detection. With `detect-changes: true`, change detection (`dorny/paths-filter`) skips jobs whose inputs haven't changed; without it every job runs.

### Change detection paths

| Filter        | Paths                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `web`         | `apps/web/**`                                                                                         |
| `backend`     | `apps/backend/**`                                                                                     |
| `mobile`      | `apps/mobile/**`                                                                                      |
| `packages`    | `packages/validators/**`, `packages/types/**`, `packages/common/**`                                   |
| `mock-server` | `packages/mock-server/**`                                                                             |
| `structure`   | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.github/workflows/**`, `.github/actions/**` |

### Jobs

| Job                      | Runs when                                        | What it does                                                                    |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| **test-web-functions**   | web, packages, or structure changed              | Builds frontend, runs Vitest unit tests                                         |
| **test-validators**      | packages or structure changed                    | Runs validator Vitest tests                                                     |
| **test-common**          | packages or structure changed                    | Runs common package Vitest tests                                                |
| **test-backend**         | backend, packages, or structure changed          | Builds backend, runs Vitest tests across SQLite, PostgreSQL, and MySQL (matrix) |
| **test-mobile**          | mobile, packages, or structure changed           | Runs mobile Vitest tests                                                        |
| **test-web-e2e**         | web, packages, mock-server, or structure changed | Runs Playwright E2E tests on Chromium                                           |
| **validate-expo**        | mobile or structure changed                      | Runs `expo-doctor` and `expo install --check`                                   |
| **validate-api-docs**    | backend, packages, or structure changed          | Validates API doc generation                                                    |
| **validate-web-docs**    | web, packages, or structure changed              | Builds VitePress web docs (no screenshots)                                      |
| **validate-mobile-docs** | mobile, packages, or structure changed           | Builds VitePress mobile docs (no screenshots)                                   |

### Backend database matrix

The `test-backend` job uses a strategy matrix to run the full test suite against all three supported database engines in parallel.

PostgreSQL and MySQL run as GitHub Actions service containers with health checks. Tests for these engines use `--no-file-parallelism` since they share a single database instance, with table data cleaned between suites.

### Coverage

When called with `upload-coverage: true`, each test job runs `test:coverage` and uploads a `coverage-<package>` artifact (retained 1 day) for `pr-report.yml` to consume. Backend coverage is collected from the SQLite run only and uploaded as `coverage-backend`.

## Android Smoke Tests (`_smoke-android.yml`)

Reusable workflow (also triggerable manually). Runs in the release's verify stage.

1. `setup-android`: Java, Android SDK, cached Expo prebuild and Gradle dependencies
2. Builds an x86_64 release APK (`assembleRelease`) and uploads it as `android-test-apk` (retained 1 day) for the release's mobile doc screenshots
3. `start-mock-server`
4. `run-android-emulator`: runs the Maestro smoke flows from `apps/mobile/e2e/smoke/`
5. Uploads Maestro debug output as an artifact (retained 7 days)

## Docker Smoke Tests (`_smoke-docker.yml`)

Reusable workflow (also triggerable manually). Runs in the release's verify stage. Matrix of image × platform (`linux/amd64`, `linux/arm64` on native runners): builds each image, runs it and checks it responds. Pushes nothing and builds without a layer cache: each release tag is its own cache scope and nothing on `main` builds the images, so a cache would never be hit.

## Release (`release.yml`)

Triggered by version tags (`v*.*.*`). Only one release runs at a time and none is cancelled part-way.

Jobs run in three stages, each waiting on every job in the one before, so nothing is published unless everything has verified and built:

1. **Verify** — lint, tests, Android and Docker smoke tests (in parallel)
2. **Build** — docs sites and the signed Android bundle
3. **Publish** — Docker images, docs, Play Store, then the GitHub release last

### Release jobs

| Stage   | Job                        | What it does                                                                                                                                                     |
| ------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verify  | **lint**                   | Calls `_lint.yml`                                                                                                                                                |
| Verify  | **tests**                  | Calls `_tests.yml` (no change detection, no coverage upload)                                                                                                     |
| Verify  | **smoke-android**          | Calls `_smoke-android.yml`                                                                                                                                       |
| Verify  | **smoke-docker**           | Calls `_smoke-docker.yml`                                                                                                                                        |
| Build   | **build-api-docs**         | Generates API docs with version stamp, uploads artifact                                                                                                          |
| Build   | **build-webui-user-docs**  | Takes Playwright screenshots, builds VitePress docs, uploads artifact                                                                                            |
| Build   | **build-mobile-user-docs** | Installs the smoke test's APK, takes Maestro screenshots on the emulator, builds VitePress docs                                                                  |
| Build   | **build-android**          | Clean prebuild with the release version, builds signed AAB using keystore secrets                                                                                |
| Publish | **docker-publish**         | Per image, calls `docker/github-builder` to build natively per platform and push signed multi-arch `ghcr.io/.../cellarboss-{web,backend}` semver + `latest` tags |
| Publish | **deploy-docs**            | Assembles `/api`, `/web`, `/mobile` under `_site/`, deploys to GitHub Pages                                                                                      |
| Publish | **deploy-android**         | Uploads AAB to Google Play internal testing track (draft status)                                                                                                 |
| Publish | **create-release**         | After the other publish jobs: publishes the GitHub release via release-drafter, attaches the versioned AAB                                                       |

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
