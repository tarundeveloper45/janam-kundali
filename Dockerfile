# ─────────────────────────────────────────────
# Stage 1: Install all dependencies
# ─────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN npm install -g pnpm@9

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy every package.json so pnpm can resolve the workspace
COPY artifacts/api-server/package.json   artifacts/api-server/
COPY artifacts/kundali/package.json      artifacts/kundali/
COPY lib/api-client-react/package.json   lib/api-client-react/
COPY lib/api-spec/package.json           lib/api-spec/
COPY lib/api-zod/package.json            lib/api-zod/
COPY lib/db/package.json                 lib/db/
COPY scripts/package.json                scripts/

RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────
# Stage 2: Build everything
# ─────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app
COPY . .

# Build shared libs first (api-spec, api-client-react, etc.)
RUN pnpm run typecheck:libs 2>/dev/null || true

# Build the API server (esbuild → dist/index.mjs)
RUN pnpm --filter @workspace/api-server run build

# Build the React frontend
# BASE_PATH=/ means the app is served from the root (no sub-path prefix)
RUN PORT=3000 BASE_PATH=/ pnpm --filter @workspace/kundali run build

# ─────────────────────────────────────────────
# Stage 3: Lean production image
# ─────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Copy the bundled API server (single ESM file + pino workers)
COPY --from=builder /app/artifacts/api-server/dist ./dist

# Copy built frontend into dist/public so Express serves it
COPY --from=builder /app/artifacts/kundali/dist/public ./dist/public

# Expose port (override with -e PORT=xxxx if needed)
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3000/api/healthz || exit 1

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
