FROM node:24.22.1-alpine@sha256:eb37f58646a901dc7727cf448cae36daaefaba79de33b5058dab79aa4c04aefb AS builder
WORKDIR /app

# Mark this as a non-interactive build: skips the root "prepare" hook install
# (no git in the image) and lets pnpm proceed without TTY confirmation prompts.
ENV CI=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# better-sqlite3 has no prebuilt binary for this platform and falls back to
# node-gyp, which needs Python and a C++ toolchain to compile from source.
RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare --activate
COPY apps/backend ./apps/backend
COPY packages ./packages

RUN --mount=type=cache,id=pnpm-backend,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter backend... --store-dir /pnpm/store

RUN pnpm --filter backend build

# pnpm deploy must run in the same stage as pnpm install so the virtual store
# is live and the dependency graph can be resolved.
RUN pnpm --filter backend deploy --legacy /deployment

FROM node:24.22.1-alpine@sha256:eb37f58646a901dc7727cf448cae36daaefaba79de33b5058dab79aa4c04aefb AS runner
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
