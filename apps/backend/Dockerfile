FROM node:24.15.0-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend ./apps/backend
COPY packages ./packages

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

RUN pnpm --filter backend build

# pnpm deploy must run in the same stage as pnpm install so the virtual store
# is live and the dependency graph can be resolved.
RUN pnpm --filter backend deploy --legacy /deployment

FROM node:24.15.0-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f AS runner
WORKDIR /app

ARG APP_VERSION=development
ENV APP_VERSION=$APP_VERSION
ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:$PATH"

# Only copy what the runtime actually needs from the deployment.
COPY --from=builder /deployment/node_modules ./node_modules
COPY --from=builder /deployment/package.json ./
COPY --from=builder /deployment/kysely.config.js ./

# dist/ is gitignored so pnpm deploy omits it; copy explicitly from the builder.
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 5000
CMD ["node", "dist/src/utils/startup.js"]
