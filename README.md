<div align="center">

<img src="assets/banner.svg" alt="CellarBoss Banner" width="90%"/>

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react)](https://reactnative.dev/)
[![Hono](https://img.shields.io/badge/Hono-E36002?logo=hono&logoColor=white)](https://hono.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

Track your collection by country, region, grape variety, winemaker, and vintage. Manage physical storage locations and monitor bottle inventory.

</div>

<table>
  <tr>
    <td align="center"><a href="https://docs.cellarboss.org/web/screenshots/dashboard.png"><img src="https://docs.cellarboss.org/web/screenshots/dashboard.png" alt="Dashboard"/></a><br/><em>Dashboard</em></td>
    <td align="center"><a href="https://docs.cellarboss.org/web/screenshots/wines-list.png"><img src="https://docs.cellarboss.org/web/screenshots/wines-list.png" alt="Wine list"/></a><br/><em>Wine list</em></td>
    <td align="center"><a href="https://docs.cellarboss.org/web/screenshots/wines-detail.png"><img src="https://docs.cellarboss.org/web/screenshots/wines-detail.png" alt="Wine detail"/></a><br/><em>Wine detail</em></td>
  </tr>
  <tr>
    <td align="center"><a href="https://docs.cellarboss.org/web/screenshots/bottles-list.png"><img src="https://docs.cellarboss.org/web/screenshots/bottles-list.png" alt="Bottle inventory"/></a><br/><em>Bottle inventory</em></td>
    <td align="center"><a href="https://docs.cellarboss.org/web/screenshots/tasting-notes-list.png"><img src="https://docs.cellarboss.org/web/screenshots/tasting-notes-list.png" alt="Tasting notes"/></a><br/><em>Tasting notes</em></td>
    <td align="center"><a href="https://docs.cellarboss.org/web/screenshots/storages-detail.png"><img src="https://docs.cellarboss.org/web/screenshots/storages-detail.png" alt="Storage locations"/></a><br/><em>Storage locations</em></td>
  </tr>
</table>

## Features

- Wine database with detailed attributes (country, region, grape, winemaker, vintage)
- Bottle inventory with per-bottle storage location tracking
- Store images of your collection
- Drinking window tracking per vintage
- Tasting notes & ratings

## Quick Start

See the [installation](https://docs.cellarboss.org/web/guide/installation.html) documentation for how to get CellarBoss up and running.

Alternatively, for a development setup:

```bash
pnpm install

# Copy and configure the environment files (see docs/backend.md and docs/web.md)

cd apps/backend
pnpm auth:migrate && pnpm migrate && pnpm seed

# In separate terminals:
pnpm --filter backend dev    # port 5000
pnpm --filter web dev        # port 3000
```

## Project Structure

```
cellarboss/
├── apps/
│   ├── backend/      # Hono API server
│   ├── mobile/       # React Native mobile application
│   └── web/          # Next.js frontend
├── docs/             # Developer documentation
└── packages/
    ├── common/       # Shared functions/constants between all applications
    ├── mock-server/  # A mock backend server used for automated testing
    ├── types/        # Shared type definitions
    └── validators/   # Shared Zod validators
```

## Documentation

User and API documentation is built and deployed automatically on every release:

- [Backend API reference](https://docs.cellarboss.org/api/)
- [Web UI user guide](https://docs.cellarboss.org/web/guide/)
- [Mobile user guide](https://docs.cellarboss.org/mobile/guide/)

Developer documentation lives in the [docs/](docs/) directory:

| Document                            | Description                                            |
| ----------------------------------- | ------------------------------------------------------ |
| [Backend](docs/backend.md)          | API server architecture, database support, testing     |
| [Web Frontend](docs/web.md)         | Frontend architecture, unit tests, E2E tests           |
| [Mobile App](docs/mobile.md)        | Mobile application architecture, unit tests, E2E tests |
| [Shared Packages](docs/packages.md) | Details on all shared packages                         |
| [CI/CD](docs/ci.md)                 | GitHub Actions workflows, PR checks, releases          |

## Roadmap

- ~~Multi-database support (SQLite, PostgreSQL, MySQL)~~
- ~~Upload images of your collection~~
- ~~Tasting notes~~
- Import wine details from 3rd party websites (Vivino, Wine Society, Naked Wines etc)
- i18n
- Build & automatically deploy styled wine menus

## Contributing

Contributions are welcome — bug fixes, features, design improvements, and iOS testing help are all appreciated. Please read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

If CellarBoss is useful to you, consider [supporting the project](https://buymeacoffee.com/mattdyson).

## FAQs

### Does this project use AI-assisted development?

Yes. CellarBoss was created by [mattdy](https://github.com/mattdy) to fulfill a personal need and released publicly for others to use. AI tools such as [Claude](https://claude.ai/), [ChatGPT](https://openai.com/chatgpt/), and [GitHub Copilot](https://github.com/features/copilot) are used to aid development, including writing code, reviewing PRs, and exploring solutions.

All AI-generated code is reviewed and tested before being merged. This approach is part of how the project is maintained as a solo effort, and it will continue going forward.

### How do I install the mobile application?

**Android** — The Google Play Store requires a number of testers before an app can be released publicly. If you're interested in helping test, please [get in touch](mailto:contact@cellarboss.org).

**iOS** — The React Native codebase supports iOS in principle, but there are currently no Apple devices available to build and test against. If you're interested in helping develop and/or test an iOS build, please [get in touch](mailto:contact@cellarboss.org).

### Are you planning to offer a hosted version?

There are no current plans, but this could be explored if there is sufficient community interest.

### Can I use this commercially?

CellarBoss is licensed under the [GNU General Public License v3.0](LICENSE), which permits free use, modification, and distribution — including in commercial settings — provided that any distributed modifications are also released under the same licence.

If you are building a commercial product on top of CellarBoss and would like to discuss a separate commercial arrangement, please [get in touch](mailto:contact@cellarboss.org). In the meantime, consider [supporting the project](https://buymeacoffee.com/mattdyson).

### Can you add X feature?

Feature requests and suggestions are welcome via [GitHub Issues](https://github.com/CellarBoss/cellarboss/issues).

### I found a bug!

Please raise a [GitHub Issue](https://github.com/CellarBoss/cellarboss/issues) with as much detail as possible. Even better — open a [pull request](https://github.com/CellarBoss/cellarboss/pulls) with a fix. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidance.

## License

CellarBoss is licensed under the [GNU General Public License v3.0](LICENSE).
