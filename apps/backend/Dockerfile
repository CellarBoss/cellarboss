FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* turbo.json* ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run install again with full source present so pnpm creates workspace-local
# node_modules symlinks (e.g. apps/backend/node_modules). The .pnpm virtual
# store is already in node_modules so no packages are re-downloaded.
RUN pnpm install --frozen-lockfile

RUN pnpm --filter backend build

FROM node:20-alpine AS runner

ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

# Copy the pnpm virtual store and workspace node_modules together so the
# relative symlinks inside apps/backend/node_modules resolve correctly.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/kysely.config.js ./apps/backend/kysely.config.js

COPY apps/backend/docker-entrypoint.sh ./apps/backend/docker-entrypoint.sh
RUN chmod +x ./apps/backend/docker-entrypoint.sh

# Set workdir to the workspace root so that dist/, node_modules/, and pnpm
# script paths in startup.js all resolve relative to apps/backend.
WORKDIR /app/apps/backend

EXPOSE 5000

ENTRYPOINT ["/app/apps/backend/docker-entrypoint.sh"]
