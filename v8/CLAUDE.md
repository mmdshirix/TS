# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TalkSell is a Persian-language (RTL) multi-tenant SaaS platform for creating and deploying AI-powered e-commerce chatbots. Built with Next.js 15 (App Router), React 19, TypeScript, PostgreSQL, and DeepSeek API for AI responses. The UI uses shadcn/ui components with Tailwind CSS and the Vazir Persian font.

## Commands

- **Dev server:** `npm run dev` (runs on port 3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Start production:** `npm run start`
- **Docker:** `docker-compose up -d`

No formal test framework exists. Manual testing is done via `/test-*` and `/debug-*` routes in the app.

## Architecture

### Key Directories

- `app/` — Next.js App Router: pages, layouts, and API routes
- `app/api/` — REST API endpoints (chat, chatbots, admin-panel, dashboard, subscription, tickets)
- `app/dashboard/` — Authenticated user dashboard (analytics, chatbots, knowledge-base, settings, etc.)
- `app/admin/` — Admin panel for per-chatbot admin users
- `app/widget/` — Embeddable chatbot widget pages (loaded cross-origin via iframe)
- `components/` — React components; `components/ui/` contains shadcn/ui primitives
- `lib/` — Core business logic and utilities
- `scripts/` — SQL migration scripts
- `public/widget-loader.js` — Client-side script customers embed on their sites

### Core Modules in `lib/`

- **`db.ts`** — Database access layer with type definitions and all query functions. Uses `getSql()` factory (must be called inside functions, never at module level, to avoid build-time DB connections).
- **`auth.ts`** — Custom session-based authentication using bcryptjs and session tokens in cookies.
- **`subscription-system.ts`** — Subscription management, plan enforcement, and usage tracking. Integrates with TalkSell WordPress API for payments.
- **`plan-limits.ts`** — Plan limit checks (4 tiers: Demo, Start, Grow, Scale).
- **`admin-auth.ts`** — Separate authentication system for per-chatbot admin users.
- **`talksell-api.ts`** — WordPress/WooCommerce API integration for payment verification.

### Key Patterns

- **Database access:** Always call `getSql()` inside functions. Never instantiate at module level.
- **API routes:** All use `export const dynamic = 'force-dynamic'` and `export const runtime = 'nodejs'`.
- **Middleware (`middleware.ts`):** Handles CORS for all API/widget requests, removes frame restrictions for widget paths, and redirects unauthenticated users from `/dashboard` to `/login`.
- **Widget system:** Cross-origin embeddable via `widget-loader.js` → iframe pointing to `/widget/[chatbotId]`.
- **All user-facing text is in Persian.** Error messages, labels, documentation pages — everything customer-facing is Farsi.

### Environment Variables

Required at runtime (not build time):
- `DATABASE_URL` — PostgreSQL connection string
- `DEEPSEEK_API_KEY` — AI API key for chat responses
- `NEXT_PUBLIC_APP_URL` — Public base URL of the application

Build uses a fake `DATABASE_URL` to avoid requiring a real DB connection during `next build`.
