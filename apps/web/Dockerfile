FROM node:24.16.0-alpine@sha256:21f403ab171f2dc89bad4dd69d7721bfd15f084ccb46cdd225f31f2bc59b5c9a AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable && corepack prepare --activate
COPY apps/web ./apps/web
COPY packages ./packages

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    CI=true pnpm install --frozen-lockfile --store-dir /pnpm/store

ARG APP_VERSION=development
ENV APP_VERSION=$APP_VERSION
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @cellarboss/web build

FROM node:24.16.0-alpine@sha256:21f403ab171f2dc89bad4dd69d7721bfd15f084ccb46cdd225f31f2bc59b5c9a AS runner
WORKDIR /app

ARG APP_VERSION=development
ENV APP_VERSION=$APP_VERSION
ENV NODE_ENV=production

# standalone/ is a self-contained server with a minimal node_modules.
# Static assets and public files must be copied alongside it.
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
