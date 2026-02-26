FROM node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 AS base
WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* turbo.json* ./
COPY apps/web/package.json apps/web/package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run install again with full source present so pnpm creates workspace-local
# node_modules symlinks (e.g. apps/web/node_modules). The .pnpm virtual
# store is already in node_modules so no packages are re-downloaded.
RUN pnpm install --frozen-lockfile

RUN pnpm --filter web build

FROM node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 AS runner

ENV NODE_ENV=production

WORKDIR /app

# standalone/ contains a minimal node_modules with only runtime dependencies.
# Static assets and public files must be copied in alongside it.
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
