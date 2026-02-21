FROM node:20-alpine AS base
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

FROM node:20-alpine AS runner

ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

# Copy the pnpm virtual store and workspace node_modules together so the
# relative symlinks inside apps/web/node_modules resolve correctly.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "start"]
