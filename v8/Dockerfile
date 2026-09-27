# syntax=docker/dockerfile:1
#
# Multi-stage Dockerfile — builds the Next.js app INSIDE the container.
#
# History: an earlier version of this file built in-container and hit reproducible
# "Module not found: Can't resolve '@/components/...'" failures on Chabokan's build
# host (~1.7GB RAM), even though the files existed. Root cause was memory pressure:
# a V8 heap ceiling set ABOVE the container's real memory limit (4096MB was set on a
# ~1.7GB box) plus multi-worker webpack compilation let the process get OOM-killed
# mid-build, which Next.js then reports as a spurious per-file "Module not found"
# rather than an OOM error. Fixed here by capping NODE_OPTIONS well under the actual
# limit and forcing single-worker compilation (next.config.mjs `experimental.cpus: 1`).
# If this box's build memory is lower than ~1.5GB, lower --max-old-space-size further
# (e.g. 1024) before raising Chabokan's build resource plan.

# ---- deps: install ALL dependencies, including devDependencies ----
# typescript / tailwindcss / postcss are devDependencies but are required to run
# `next build` (Tailwind/PostCSS process app/globals.css) — do NOT use --omit=dev here.
FROM node:20-alpine AS deps
WORKDIR /app

# Default Alpine/npm registries are frequently slow or unreachable from Chabokan's
# network — swap to mirrors that resolve reliably from there.
RUN sed -i 's/dl-cdn.alpinelinux.org/mirror.arvancloud.ir/g' /etc/apk/repositories
RUN npm config set registry https://mirror2.chabokan.net/npm/

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ---- builder: compile the Next.js app ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time — pass the real
# values via `docker build --build-arg` / compose's `build.args`.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_STACK_PROJECT_ID
ARG NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STACK_PROJECT_ID=$NEXT_PUBLIC_STACK_PROJECT_ID
ENV NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=$NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY

# lib/db.ts only opens a connection inside functions, never at module load, so a fake
# URL satisfies anything that reads process.env.DATABASE_URL during build. The real
# value is injected as a RUNTIME env var only (see docker-compose.yml `environment:`)
# — it must never be passed as a build arg, or it gets baked into this image's layer
# history and is readable via `docker history`/`docker inspect` by anyone with image access.
ENV DATABASE_URL="postgresql://fake:fake@localhost:5432/fake"

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=1536"

RUN npm run build

# ---- runner: minimal runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs scripts ./scripts

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run migrations on every container start before serving traffic — idempotent
# (CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS throughout scripts/*.sql), so
# safe to re-run on every restart/redeploy. Uses `;` not `&&` so a migration hiccup
# (e.g. the DB being briefly unreachable) never prevents the app itself from starting;
# `exec` hands off to the actual server process so it receives signals correctly and
# is what the HEALTHCHECK above is really probing.
CMD ["sh", "-c", "node scripts/run-migrations.js; exec node server.js"]
