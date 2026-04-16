# Contributing to CellarBoss

Thank you for your interest in contributing. This document covers everything you need to get started.

## Ways to Contribute

- **Bug reports** — open a [GitHub Issue](https://github.com/CellarBoss/cellarboss/issues) with steps to reproduce
- **Feature requests** — open a [GitHub Issue](https://github.com/CellarBoss/cellarboss/issues) describing the use case
- **Bug fixes & features** — open a pull request (see workflow below)
- **Design & branding** — UI/UX improvements and logo work are very welcome; get in touch via [GitHub Issues](https://github.com/CellarBoss/cellarboss/issues)
- **Mobile testing** — if you have Apple/Android hardware and want to help build/test the React Native app, please [get in touch](mailto:contact@cellarboss.org)
- **Documentation** — corrections, clarifications, and additions to [docs/](docs/) or the [user guides](https://docs.cellarboss.org)

## Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/) — used for all package management
- [Docker](https://www.docker.com/) — optional, but recommended for running a local database

## Development Setup

1. **Fork and clone** the repository

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   See [docs/backend.md](docs/backend.md) and [docs/web.md](docs/web.md) for descriptions of each variable.

4. **Set up the database**

   ```bash
   cd apps/backend
   pnpm auth:migrate && pnpm migrate && pnpm seed
   ```

5. **Start the development servers** (in separate terminals)

   ```bash
   pnpm --filter backend dev    # http://localhost:5000
   pnpm --filter web dev        # http://localhost:3000
   ```

## Running Tests

```bash
# Unit tests (backend, web, validators)
pnpm test

# End-to-end tests (Playwright, uses mock server)
pnpm --filter web test:e2e
```

See [docs/backend.md](docs/backend.md) and [docs/web.md](docs/web.md) for more detail on the test setup.

## Pull Request Workflow

1. **Create a branch** from `main` with a descriptive name:
   - `fix/bottle-count-off-by-one`
   - `feat/website-import`
   - `docs/improve-installation-guide`

2. **Make your changes**, keeping commits focused and the diff reviewable.

3. **Ensure tests pass** locally before opening a PR.

4. **Open a pull request** against `main`. Include:
   - A descriptive title, prefixed with the type of PR you're submitting
     - Bugfix example: `fix: Bottle count off-by-one error in web Wine list view`
     - Documentation example: `docs: Add detailed steps for Bottle creation on mobile`
     - Feature example: `feat: Add new average price graph to web Dashboard page`
   - A clear description of what changed and why
   - Link to all relevant [GitHub Issues](https://github.com/CellarBoss/cellarboss/issues) where relevant
   - Steps to test the change
   - Screenshots for any UI changes

5. **Address review feedback** — the PR will be merged once approved.

## Code Style

- TypeScript is used throughout; avoid `any` where possible
- Formatting is enforced by Prettier — run `pnpm format` before committing
- Linting is enforced by ESLint — run `pnpm lint` to check
- Prefer editing existing abstractions over introducing new ones unless clearly necessary

## Commit Messages

Use conventional commits where possible. Commits will be squashed on merge into `main`.

## Reporting Security Issues

Please do **not** open a public issue for security vulnerabilities. Instead, email [contact@cellarboss.org](mailto:contact@cellarboss.org) with details and we will respond promptly.

## License

By contributing to CellarBoss, you agree that your contributions will be licensed under the [GNU General Public License v3.0](LICENSE).
