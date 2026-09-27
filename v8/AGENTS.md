# TalkSell — Agent Guide

Persian-language (RTL) multi-tenant SaaS for AI e-commerce chatbots. Next.js 15 App Router, React 19, TypeScript, PostgreSQL, shadcn/ui, Tailwind CSS, DeepSeek API.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint via `next lint` |
| `npm run start` | Serve production build |
| `docker-compose up -d` | Docker deployment |
| `node scripts/run-migrations.js` | Apply SQL migrations from `scripts/*.sql` |

No test framework. Manual testing via `/test-*` and `/debug-*` routes.

## Build quirks

- **`next.config.mjs`**: `output: 'standalone'`, `eslint.ignoreDuringBuilds: true`, `typescript.ignoreBuildErrors: true`, `images.unoptimized: true`. Build passes despite TS/Lint errors.
- Build uses a **fake `DATABASE_URL`** — real DB connection only at runtime.
- `serverExternalPackages: ['mysql2']` — remains from a past config, harmless.
- API routes **must** have `export const dynamic = 'force-dynamic'` and `export const runtime = 'nodejs'` to prevent build-time DB access.

## Architecture

### Directory layout

- `app/` — App Router pages + API routes
- `app/dashboard/` — Authenticated user dashboard
- `app/admin/` — Per-chatbot admin panel
- `app/super-admin/` — Super admin panel
- `app/widget/[id]/` — Chatbot widget iframe page (cross-origin embed)
- `app/api/` — REST endpoints (chat, chatbots, dashboard, subscription, tickets, admin-panel, super-admin)
- `components/` — React components; `components/ui/` has shadcn/ui primitives
- `lib/` — Business logic
- `scripts/` — SQL migration files (run via `run-migrations.js`)
- `public/widget-loader.js` — Client-side embed script (1125 lines)

### Database

- **PostgreSQL** via `postgres` (postgres.js) package.
- `lib/db.ts` — All SQL queries + type definitions + schema initialization (`initializeDatabase()`).
- **Always call `getSql()` inside functions**, never at module level (prevents build-time DB connections).
- Schema is maintained both as SQL files in `scripts/` and programmatically in `initializeDatabase()`.

### Auth (two separate systems)

1. **User auth** (`lib/auth.ts`): Session-based with bcryptjs, session tokens in cookies. Routes in `app/api/user/`.
2. **Per-chatbot admin auth** (`lib/admin-auth.ts`): Separate admin users per chatbot. Routes in `app/api/admin-panel/`.

### Widget system

- `public/widget-loader.js` embed script → creates iframe → loads `app/widget/[id]/`.
- CORS headers and CSP `frame-ancestors *` set in both `next.config.mjs` and `middleware.ts`.
- `middleware.ts` matcher: `["/api/:path*", "/widget/:path*", "/widget-loader.js", "/dashboard/:path*"]`.

### Key libraries

- `postgres` (postgres.js) — SQL queries with tagged template literals
- `bcryptjs` — Password hashing
- `zod` — Schema validation (sparingly used)
- `react-hook-form` + `@hookform/resolvers` — Forms
- `recharts` — Analytics charts
- `lucide-react` — Icons
- `date-fns` — Date formatting

## Deploy targets

- **Docker**: Multi-stage `Dockerfile` (node:20-slim), `docker-compose.yml` with healthcheck.
- **Vercel**: `vercel.json` sets API route maxDuration 30s.
- **Liara (Iranian cloud)**: `liara.json` with healthcheck at `/api/database/test`.

## Style & conventions

- **All UI text is Persian (Farsi)** — error messages, labels, everything customer-facing.
- RTL layout: `<html lang="fa" dir="rtl" className="light">` in root layout.
- Font: Vazir (loaded via CDN in `app/layout.tsx`).
- Dark mode via `class` strategy (`darkMode: "class"`).
- Vazir font is the `font-vazir` Tailwind class and the default `font-sans`.
- shadcn/ui `components.json` config: baseColor `neutral`, CSS variables enabled, icon lib `lucide`.
- No Prettier, no Biome — only ESLint via Next.js built-in.

## Environment variables (runtime)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AI_PROVIDER` | `arvan` (default) or `deepseek` — all AI traffic goes through `lib/ai` |
| `ARVAN_API_URL` / `ARVAN_API_KEY` / `ARVAN_MODEL` | ArvanCloud AI gateway (primary) |
| `DEEPSEEK_API_KEY` | DeepSeek (switchable fallback) |
| `META_APP_ID` / `META_APP_SECRET` / `INSTAGRAM_VERIFY_TOKEN` / `INSTAGRAM_TOKEN_ENCRYPTION_KEY` | Instagram DM automation (see docs/instagram-setup.md) |
| `STOREFRONT_BASE_DOMAIN` | e.g. `tsll.ir` — used for store links, sitemaps and Instagram cards |
| `NEXT_PUBLIC_APP_URL` | Public base URL |
| `STACK_SECRET_SERVER_KEY` | Stack Auth (referenced in docker-compose but not actively used in code) |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Optional, configured but unused |


# To Do 

i see this log in console 1684-1552b9c5a0fe2182.js:1 [v0] API response not OK: 404 window.console.error @ 1684- 1552b9c5a0fe2182.js:1 eL @ 1009-713d7e40b84bc2f3.js:1 await in eL eM @ 1009-713d7e40b84bc2f3.js:1 iG @ 4bd1b696- 6a4f9e5980969a9e.js:1 (anonymous) @ 4bd1b696-6a4f9e5980969a9e.js:1 nS @ 4bd1b696-6a4f9e5980969a9e.js:1 i4 @ 4bd1b696- 6a4f9e5980969a9e.js:1 ce @ 4bd1b696-6a4f9e5980969a9e.js:1 s9 @ 4bd1b696-6a4f9e5980969a9e.js:1 1684- 1552b9c5a0fe2182.js:1 [v0] Error sending message: Error: HTTP error! status: 404 at eL (1009- 713d7e40b84bc2f3.js:1:18261) at async eM (1009-713d7e40b84bc2f3.js:1:21842) and looks like i cant make conversation fix it and add ficher in super-admin for can swich be twin deepseek ai via this api key : [DEEPSEEK_API_KEY in .env] and arvan ai with https://arvancloudai.ir/gateway/models/Xerxes-1/[redacted]/v1 . api : [ARVAN_API_KEY in .env] this 2 model as ai servise . do not change system rules just add this and make /login page mobile more biautiful and rtl
and my deepseek api key is : [DEEPSEEK_API_KEY in .env]

## Changes made

1. **Driver swap**: Replaced `@neondatabase/serverless` with `postgres` (postgres.js) across 21 files. The API (tagged template literals) is identical — only import/call patterns changed from `neon()` to `postgres()`.

2. **Persian guide**: Created `docs/database-setup-guide.md` covering PostgreSQL setup, env config, migration execution, table structure, and common error fixes — entirely in Persian.

3. **Docker**: Dockerfile already configured for `next build` with `standalone` output and fake `DATABASE_URL` at build time — no structural changes needed for the driver swap. Docker build tested; fails only due to external network (Debian repos unreachable) in this environment.

4. **Build verified**: `npm run build` compiles successfully. Build-time DB errors are caught by try/catch handlers in test pages (same pre-existing behavior).

## To Do - Completed

### 1. Fix chat API 404 error
- Added dual AI provider support (DeepSeek + Arvan Cloud AI) in `app/api/chat/route.ts`
- Added `AI_PROVIDER` and `ARVAN_API_KEY` environment variables support
- Created `callDeepSeekAPI()` helper function that routes to either provider based on `ai_provider` field or global settings
- Added database columns: `ai_provider` (deepseek/arvan) and `arvan_api_key` in `lib/db.ts` and migration SQL

### 2. Add AI Provider Switcher in Super Admin
- Created `/app/super-admin/ai-settings/page.tsx` for AI configuration page
- Created `/components/super-admin-ai-settings.tsx` with full UI for switching between DeepSeek and Arvan
- Added `global_settings` table creation in `app/api/super-admin/settings/route.ts`
- Added link to AI settings in super-admin dashboard
- Settings are saved to database and persist across sessions

### 3. Improve /login Page Mobile & RTL
- Completely redesigned login page with mobile-first responsive design
- Added beautiful animated carousel on desktop with icons (Bot, Sparkles, Zap, Shield)
- Improved mobile layout with centered card and better spacing
- Enhanced RTL support throughout the form
- Added loading states with spinners
- Improved input fields with icons and better validation feedback
- Added smooth transitions and gradient styling

## v9 additions (Taxel)

- `lib/ai/` — single AI entry point (`chatCompletion`, `streamChatCompletion`, `askAI`, tones, budgets). `lib/deepseek.ts` is a compatibility facade; never call provider URLs directly.
- `lib/store-categories.ts` — 8 templates incl. `medical` (kind `clinic`) and `pharmacy`. `getStoreKind()` drives the sidebar and dashboard modules.
- `lib/clinic-db.ts`, `lib/pharmacy-db.ts`, `lib/seo-db.ts`, `lib/onboarding-db.ts`, `lib/intake.ts`, `lib/instagram.ts` — new modules; tables in `scripts/create-taxel-v9-platform.sql`.
- `scripts/setup.js` (`npm run db:setup`) — migrations + defaults + admin user + WordPress intake API key.
- `app/start` + `app/api/intake/*` — WordPress plugin hand-off. Plugin source in `wordpress-plugin/`.
- Storefront (`../v8-storefront`): `lib/themes.ts` registry, `components/themes/<slug>/home.tsx` per category, `components/motion` primitives, clinic booking (`/book`), pharmacy (`/prescription`), SEO helpers in `lib/seo.tsx`, `sitemap.xml` / `robots.txt` routes.
