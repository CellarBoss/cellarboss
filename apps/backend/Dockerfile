FROM node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 AS base
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

FROM base AS deploy
WORKDIR /app

COPY --from=builder /app ./

# Create a self-contained deployment directory with only production dependencies.
# pnpm deploy dereferences symlinks and excludes devDependencies, eliminating
# the pnpm virtual store from the final image.
RUN pnpm deploy --filter backend --prod /deployment

FROM node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 AS runner

ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

# Production node_modules (flat, no pnpm virtual store) and config files.
COPY --from=deploy /deployment ./

# dist/ is gitignored so pnpm deploy omits it; copy it explicitly from the builder.
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/src/utils/startup.js"]
