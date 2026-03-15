# CI/CD

All CI runs on GitHub Actions. Workflows are defined in `.github/workflows/`.

## Pull Request Checks (`pr-checks.yml`)

Every PR triggers the following jobs. Change detection (`dorny/paths-filter`) ensures test jobs only run when relevant files are modified.

| Job                    | Trigger Condition           | What it does                                                         |
| ---------------------- | --------------------------- | -------------------------------------------------------------------- |
| **check-title**        | Always                      | Validates semantic PR title (feat, fix, refactor, chore, docs, deps) |
| **prettier**           | Always                      | Checks formatting with `prettier --check`                            |
| **test-web-functions** | Web or common changes       | Builds frontend, runs Vitest unit tests with coverage                |
| **test-validators**    | Validator or common changes | Runs validator Vitest tests with coverage                            |
| **test-backend**       | Backend or common changes   | Builds backend, runs Vitest tests with coverage                      |
| **test-web-e2e**       | Web or common changes       | Runs Playwright E2E tests on Chromium                                |
| **validate-api-docs**  | Backend changes             | Validates API doc generation                                         |
| **validate-web-docs**  | Web changes                 | Validates VitePress docs build                                       |

All jobs use Node.js 24.14.0.

## Release (`release.yml`)

Triggered by version tags (`v*.*.*`). Runs all PR checks plus:

- **build-api-docs** — generates API documentation with version stamp
- **build-webui-user-docs** — generates user docs with Playwright screenshots
- **deploy-docs** — publishes to GitHub Pages (landing page + `/api` + `/web` subdirectories)
- **docker-frontend** — builds and pushes web image to `ghcr.io`
- **docker-backend** — builds and pushes backend image to `ghcr.io`

## Running Tests Locally

```bash
# Backend
cd apps/backend && pnpm test

# Validators
cd packages/validators && pnpm test

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
