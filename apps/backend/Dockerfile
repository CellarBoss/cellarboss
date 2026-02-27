FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend ./apps/backend
COPY packages ./packages

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

RUN pnpm --filter backend build

# pnpm deploy must run in the same stage as pnpm install so the virtual store
# is live and the dependency graph can be resolved.
RUN pnpm --filter backend deploy --legacy /deployment

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# pnpm is required at runtime: startup.js calls execSync("pnpm migrate/seed").
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

# Production package.json + node_modules from pnpm deploy.
COPY --from=builder /deployment ./

# dist/ is gitignored so pnpm deploy omits it; copy explicitly from the builder.
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 5000
CMD ["node", "dist/src/utils/startup.js"]
