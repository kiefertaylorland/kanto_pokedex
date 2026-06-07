# Kanto Pokédex

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

## Deployment

Configured once per environment (local / preview / production). The **production** environment is
provisioned against Supabase project `wdptkswyfujtzkftzjsm` and Cloudflare Pages project
`kantopokedex` (origin `https://kantopokedex.pages.dev`).

### Provisioned (production backend — done)

- **Supabase** — migrations applied, curated Kanto map seeded (17 locations + map points), the
  `sync-pokeapi` Edge Function deployed (`verify_jwt=false`; it does its own `SYNC_SECRET` bearer
  check), one full sync run (151 Pokémon), and 23 curated encounters loaded. A weekly `pg_cron` job
  (`sync-pokeapi-weekly`, Mon 06:00 UTC) triggers the function via Vault-stored `sync_url`/`sync_secret`.
- **Standard public-schema grants** restored to `anon/authenticated/service_role` (RLS gates every
  table); `service_role` `statement_timeout` raised to `120s` for the bulk sync; `SECURITY DEFINER`
  helpers (`handle_new_user`, `rls_auto_enable`) revoked from client roles (SEC hygiene).
- **CI/CD secrets** — `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`, `CLOUDFLARE_ACCOUNT_ID` and
  variables `PROD_URL`, `HEADERS_SMOKE_URL` set on the GitHub repo. The service-role key lives ONLY
  in the Supabase function env / CI store — never in `VITE_` vars (SEC-005).

> Re-running from scratch (any environment): `supabase db push` + seed `supabase/seed.sql`;
> `supabase functions deploy sync-pokeapi --no-verify-jwt`; `supabase secrets set SYNC_SECRET=…`;
> trigger one sync; load `supabase/seed/curated_encounters.sql`; apply
> `supabase/functions/sync-pokeapi/schedule.sql` (after storing the Vault secrets) for the cron.
> If reads return 403, ensure the standard Supabase grants exist (local `supabase db reset` applies
> them automatically).

### Remaining manual steps (your accounts/credentials)

1. **OAuth providers** — create a Google OAuth client and a GitHub OAuth app, each with the provider
   callback `https://wdptkswyfujtzkftzjsm.supabase.co/auth/v1/callback`. In Supabase Auth, enable
   Google + GitHub + email magic link, paste each client id/secret, set Site URL
   `https://kantopokedex.pages.dev` and add redirect `https://kantopokedex.pages.dev/auth/callback`.
2. **Cloudflare Pages** — create/connect a **Pages** project named `kantopokedex` (Connect to Git →
   `kiefertaylorland/kanto_pokedex`): build `pnpm build`, output `apps/web/dist`, functions
   auto-detected from `functions/`; production branch `main`, previews per PR. Set Pages env vars
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_ENV=production` (+ optional
   `VITE_SENTRY_DSN`). `apps/web/public/_headers` supplies the CSP/HSTS headers (SEC-011).
3. **Remaining secrets** — set `CLOUDFLARE_API_TOKEN` (Pages:Edit) and optional `SENTRY_DSN`; for CI
   E2E set `RUN_E2E=true` + `E2E_SUPABASE_*` against a separate test project.

Next Spec Kit steps: `/speckit-tasks` then `/speckit-implement` to formalize the task breakdown,
or continue iterating directly.
