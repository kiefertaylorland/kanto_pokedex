# Quickstart: Kanto Pokédex

Run/validate guide. Implementation details live in `tasks.md` and the code; this proves the feature works end-to-end.

## Prerequisites

- Node 20+ and pnpm 9+ (`corepack enable`)
- Supabase CLI (`supabase`) and Docker (for local stack), or a Supabase project
- A `.env` in `apps/web/` with **public** config only:
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```
- Server secrets (never `VITE_`-prefixed, never committed): `SUPABASE_SERVICE_ROLE_KEY`, `SENTRY_DSN` — set in Supabase function secrets / CI store (SEC-005).

## Setup

```bash
pnpm install
supabase start                       # local Postgres + Auth + Studio
supabase db reset                    # apply migrations + seed (curated map data)
supabase functions serve sync-pokeapi # optional: run sync locally
# trigger the sync once to populate the 151 Pokémon
curl -X POST "$SUPABASE_URL/functions/v1/sync-pokeapi" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
pnpm dev                             # Vite dev server for apps/web
```

## Validation scenarios (map to spec success criteria)

| # | Steps | Expected | Ref |
|---|---|---|---|
| 1 | Visit `/` unauthenticated | Static landing page, no live protected data; CTA to sign in | SC-001, FR-007 |
| 2 | Visit `/pokedex` unauthenticated | Redirect to `/auth`; no protected data leaked | SC-008 |
| 3 | Sign in (Google/GitHub/magic-link) | Land on `/pokedex` | SC-002 |
| 4 | Browse | All 151 across pages of 20; cards show number/name/sprite/types | SC-003 |
| 5 | Search `bulb` then `25` | Bulbasaur line; then only #025 (Pikachu) | SC-005 |
| 6 | Multi-select Water + Fire types | Union of both types shown | FR-011 |
| 7 | Sort by base-stat total, go to page 2, reload | State persists via URL | SC-005, FR-014 |
| 8 | Open Eevee, Snorlax, Mew details | Full data + fallbacks (Mew: no-encounter state); Red/Blue flavor text | SC-006 |
| 9 | Visit `/pokemon/9999` | Not-found state | edge case |
| 10 | Open `/map` desktop + mobile, tap a marker | Encounter panel with provenance labels + method; link to detail | SC-007 |
| 11 | Tap an empty location marker | Marker shown + empty-state panel | edge case |

## Automated checks

```bash
pnpm typecheck && pnpm lint && pnpm test       # unit/component + RLS policy tests
pnpm test:e2e                                  # Playwright smoke: login → browse → detail → map
pnpm build                                     # production build
# CI also runs: secret-scan (SEC-005), axe-core + Lighthouse budgets (SC-010), header smoke (SEC-011)
```

## Sync integrity check (SEC-014)

```bash
# After a run, the latest sync_runs row should be status=success, records_processed=151
# Re-running must NOT change kanto_locations / kanto_map_points (curated coords preserved)
```

See [data-model.md](./data-model.md) and [contracts/](./contracts/) for schema/contract detail.
