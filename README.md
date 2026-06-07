# Kanto Pokédex

🔗 **Live app:** [kanto-pokedex.pages.dev](https://kanto-pokedex.pages.dev)

An auth-gated, Generation-I (National Dex 1–151) Pokédex: browse/search/filter/sort all 151
Pokémon, view detail pages (stats, abilities, evolution, Red/Blue flavor text, encounters), and
explore a retro Kanto SVG map. Built to conform to `/.specify/memory/constitution.md` v1.0.0
(security principles SEC-001…SEC-015).

**Stack:** React 18 + Vite + TanStack Router/Query + Tailwind + shadcn/ui + Zod (pnpm monorepo) ·
Supabase (Postgres + Auth + Edge Functions) · Cloudflare Pages + Pages Functions.

## Layout

```
apps/web              React SPA (routes, features, lib, components)
packages/shared       Zod contracts + types + constants (single source of truth)
functions/api         Cloudflare Pages Functions (BFF: /api/health)
supabase/             migrations · seed (curated map) · functions/sync-pokeapi · tests (RLS pgTAP)
scripts/              secret-scan (SEC-005) · check-headers (SEC-011)
specs/001-kanto-pokedex/   spec, plan, research, data-model, contracts, quickstart
```

## Local development

See [`specs/001-kanto-pokedex/quickstart.md`](specs/001-kanto-pokedex/quickstart.md) for the full
walkthrough. In short:

```bash
pnpm install
supabase start                 # local Postgres + Auth (Docker)
supabase db reset              # apply migrations + seed the curated Kanto map
supabase functions serve sync-pokeapi --no-verify-jwt   # run the sync locally
# trigger one sync (service-role bearer), then load curated encounters:
curl -X POST http://127.0.0.1:54321/functions/v1/sync-pokeapi \
  -H "Authorization: Bearer $(supabase status -o env | sed -n 's/^SERVICE_ROLE_KEY=//p' | tr -d '\"')"
psql "$(supabase status -o env | sed -n 's/^DB_URL=//p' | tr -d '\"')" -f supabase/seed/curated_encounters.sql

cp apps/web/.env.example apps/web/.env   # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
pnpm dev
```

## Quality gates

```bash
pnpm typecheck      # strict TS across workspaces
pnpm lint           # ESLint incl. SEC-009 react/no-danger
pnpm test           # Vitest (shared schemas + web components)
pnpm build          # production build
pnpm secret-scan    # SEC-005: fails on a service_role JWT in source/bundle
supabase test db    # SEC-004: pgTAP RLS cross-user-denial tests
pnpm test:e2e       # Playwright smoke (login → browse → detail → map) + axe
```

## Deployment (external setup you must complete)

These steps require your own accounts/credentials and are configured once per environment
(local / preview / production):

1. **Supabase project** — create one; apply migrations (`supabase db push`) and seed; deploy the
   sync function (`supabase functions deploy sync-pokeapi`); set its secrets (`SYNC_SECRET`); apply
   `supabase/functions/sync-pokeapi/schedule.sql` for the weekly cron.
2. **OAuth providers** — enable Google + GitHub + email magic link in Supabase Auth, and register
   the redirect URL `<env-origin>/auth/callback` for **each** environment.
3. **Cloudflare Pages** — connect the GitHub repo; build command `pnpm build`, output
   `apps/web/dist`, functions auto-detected from `functions/`. Production deploys from `main`,
   previews per PR. The `apps/web/public/_headers` file supplies the CSP/HSTS headers (SEC-011).
4. **Secrets** — set the GitHub Actions / Cloudflare / Supabase secrets referenced in
   `.github/workflows/*.yml` (`PROD_SUPABASE_*`, `CLOUDFLARE_*`, `E2E_*`, `SENTRY_DSN`). The
   service-role key lives ONLY in the Supabase function env / CI store — never in `VITE_` vars
   (SEC-005).

Next Spec Kit steps: `/speckit-tasks` then `/speckit-implement` to formalize the task breakdown,
or continue iterating directly.
