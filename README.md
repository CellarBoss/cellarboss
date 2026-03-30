# CellarBoss

An open-source wine cellar inventory manager. Track your collection by country, region, grape variety, winemaker, and vintage. Manage physical storage locations and monitor bottle inventory.

![Image of CellarBoss application showing a list of wines](https://docs.cellarboss.org/web/screenshots/wines-list.png)

## Features

- Wine database with detailed attributes (country, region, grape, winemaker, vintage)
- Bottle inventory with per-bottle storage location tracking
- Drinking window tracking per vintage

## Quick Start

See the [installation](https://docs.cellarboss.org/web/guide/installation.html) documentation for how to get CellarBoss up and running.

Alternatively, for a development setup:

```bash
pnpm install

# Configure .env files (see developer notes)

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

## User Documentation

Documentation is built and deployed automatically on every release:

- [Backend API reference](https://docs.cellarboss.org/api/)
- [Web UI user guide](https://docs.cellarboss.org/web/guide/)
- [Mobile user guide](https://docs.cellarboss.org/mobile/guide/)

## Developer Notes

| Document                            | Description                                            |
| ----------------------------------- | ------------------------------------------------------ |
| [Backend](docs/backend.md)          | API server architecture, database support, testing     |
| [Web Frontend](docs/web.md)         | Frontend architecture, unit tests, E2E tests           |
| [Mobile App](docs/mobile.md)        | Mobile application architecture, unit tests, E2E tests |
| [Shared Packages](docs/packages.md) | Details on all shared packages                         |
| [CI/CD](docs/ci.md)                 | GitHub Actions workflows, PR checks, releases          |

## Roadmap

- Multi-database support. Currently limited to Sqlite, with MySQL and Postgres in the works
- Upload images of your collection
- Import wine details from 3rd party websites (Vivino, Wine Society, Naked Wines etc)
- i18n
- Build & automatically deploy styled wine menus

## FAQs

### Has this project been 'vibe coded'?!

I ([mattdy](https://github.com/mattdy)) created this project to fufil a need in my own life, and decided to release it publically in case others find it useful.
While I do have a background in software development, I am by no means an expert in React development.
As such, I have made use of LLMs such as [ChatGPT](https://openai.com/chatgpt/), [Claude](https://claude.ai/) and [Copilot](https://github.com/features/copilot) to aid development.

I wouldn't go as far as calling this project 'vibe-coded', but certain elements have been written by AI models, and I will likely continue to utilise these within the project.
This will possibly involve future features also being written by AI, but I am also considering automatic PR reviews and the like.

I am very happy to enter into a discussion on the merits of these, respecting my position the current sole developer on the project.

### How do I install the mobile application?

**Android** - The Google Play Store requires a number of testers to use an application before it can be released publically.
If you're interested in helping test, please [get in touch](mailto:contact@cellarboss.org).

**iOS** - Theoretically the same React Native application can be built for iOS, but I do not currently have any Apple devices to test with.
If you're interested in helping develop &/or test an iOS build, then please [get in touch](mailto:contact@cellarboss.org).

### Are you planning to offer a hosted version?

No plans at the moment, but if there's enough interest then this is something that could be explored in future.

### Can I use this commercially?

It is my intention to make this software free and available for community non-profit usage, without restriction.
That said, I may choose to investigate commercial licencing arrangements in the future, should there be any demand for such support.
In the meantime, if you wish to use this software in a commercial setting, then please consider [giving back](https://buymeacoffee.com/mattdyson) to the project.

### You could use a better design/logo

Good observation! I'm terrible at graphic design, please [get in touch](https://github.com/CellarBoss/cellarboss/issue) if you can help with the styling!

### Can you add X feature?

Any feedback or suggestions are gratefully received via [Issues](https://github.com/CellarBoss/cellarboss/issues)

### I found a bug!

Great! As above, please raise an [Issue](https://github.com/CellarBoss/cellarboss/issues), or even better - provide a [PR](https://github.com/CellarBoss/cellarboss/pulls) with a fix!

## License

See [license information](LICENSE)
