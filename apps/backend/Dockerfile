FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS builder
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

FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS runner
WORKDIR /app

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
