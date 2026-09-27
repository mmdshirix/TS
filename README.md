# Taxel (TalkSell) — AI site builder platform

| Folder | What it is |
|--------|------------|
| `v8/` | Platform / admin app (Next.js 15, port 3000): dashboard, chatbot builder, store builder, AI layer, Instagram automation, WordPress intake API |
| `v8-storefront/` | Storefront app (Next.js 15, port 3001): renders published stores on `*.tsll.ir` with a dedicated theme per category |
| `v8/wordpress-plugin/taxel-ai-builder/` | WordPress plugin — the “Just tell me what to build” box (`[taxel_builder]`) |
| `deploy/` | Runtime env templates for both apps (`*.env.example`); copy to `*.env` (git-ignored) and fill in database, AI provider and admin values |

## Quick start

```bash
# 0. Secrets: copy the templates and fill in DATABASE_URL, ARVAN_API_URL, ARVAN_API_KEY, ADMIN_* …
cp deploy/platform.env.example deploy/platform.env
cp deploy/storefront.env.example deploy/storefront.env

# 1. Database: create all tables, seed defaults (Arvan as default AI), create the admin account
cd v8 && npm install && npm run db:setup          # reads ../deploy/platform.env

# 2. Run
npm run dev                                       # platform  → http://localhost:3000
cd ../v8-storefront && npm install && npm run dev # storefront → http://localhost:3001  (?store=<slug> to preview)
```

Docker: `docker compose up -d` in each folder (both compose files load `../deploy/*.env`).

## Key features

- **AI layer** (`v8/lib/ai`): ArvanCloud gateway is the default provider, DeepSeek is switchable from the super-admin panel (`/super-admin/ai-settings`), with automatic fallback, streaming, token budgeting, tone presets and reasoning-tag stripping.
- **8 store templates**, each with its own landing design: clothing, cosmetics, accessories, bags & shoes, perfumes, mobile, **medical clinic** (Jalali calendar booking + visit payment + AI triage) and **pharmacy** (prescription upload, pharmacist AI, delivery flow).
- **SEO tab** (`/dashboard/store/seo`) + storefront metadata, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`, per-page overrides and a live SEO score.
- **Onboarding**: spotlight tour, live getting-started checklist, step-by-step tutorial (`/dashboard/getting-started`).
- **WordPress → Taxel intake**: plugin posts the visitor's request to `/api/intake/*`, asks staged follow-up questions, then hands off to `/start?intake=<token>` where the store is built automatically after sign-in.
- **Instagram DM automation** (`/dashboard/instagram`): connect by page name (Meta OAuth), keyword workflows (text / image / product card / voice / delay / handoff), AI agent grounded in the chatbot knowledge base + catalogue, simulator and inbox. Setup: `v8/docs/instagram-setup.md`.
