FROM node:26.12.1-alpine@sha256:40cd011b55415bc894e45b02fdd5a5dfde056921b7d23a64c74f80497af48797 AS builder
WORKDIR /app

# Mark this as a non-interactive build: skips the root "prepare" hook install
# (no git in the image) and lets pnpm proceed without TTY confirmation prompts.
ENV CI=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# better-sqlite3 has no prebuilt binary for this platform and falls back to
# node-gyp, which needs Python and a C++ toolchain to compile from source.
RUN apk add --no-cache python3 make g++

# Node 25+ no longer bundles corepack, so install it before using it to
# activate the pnpm version pinned in package.json.
RUN npm install -g corepack@0.36.0 && corepack enable && corepack prepare --activate
COPY apps/backend ./apps/backend
COPY packages ./packages

RUN --mount=type=cache,id=pnpm-backend,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter backend... --store-dir /pnpm/store

RUN pnpm --filter backend build

# pnpm deploy must run in the same stage as pnpm install so the virtual store
# is live and the dependency graph can be resolved.
RUN pnpm --filter backend deploy --legacy /deployment

FROM node:26.12.1-alpine@sha256:40cd011b55415bc894e45b02fdd5a5dfde056921b7d23a64c74f80497af48797 AS runner
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
