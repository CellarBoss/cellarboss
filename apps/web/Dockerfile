FROM node:24.17.0-alpine@sha256:156b55f92e98ccd5ef49578a8cea0df4679826564bad1c9d4ef04462b9f0ded6 AS builder
WORKDIR /app

# Mark this as a non-interactive build: skips the root "prepare" hook install
# (no git in the image) and lets pnpm proceed without TTY confirmation prompts.
ENV CI=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable && corepack prepare --activate
COPY apps/web ./apps/web
COPY packages ./packages

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

ARG APP_VERSION=development
ENV APP_VERSION=$APP_VERSION
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @cellarboss/web build

FROM node:24.17.0-alpine@sha256:156b55f92e98ccd5ef49578a8cea0df4679826564bad1c9d4ef04462b9f0ded6 AS runner
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
