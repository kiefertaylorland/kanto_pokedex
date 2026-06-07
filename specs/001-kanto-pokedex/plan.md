# Implementation Plan: Kanto Pokédex

**Branch**: `001-kanto-pokedex` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-kanto-pokedex/spec.md`

## Summary

An auth-gated, Generation-I (National Dex 1–151) Pokédex web app. Authenticated users browse all 151 Pokémon (search/filter/sort/paginate), open detail pages (stats, abilities, evolution, Red/Blue flavor text, encounter summary), and explore a retro-inspired Kanto SVG map with encounter panels labelled by provenance. Supabase Postgres is the system of record; Supabase Auth delegates identity (Google/GitHub OAuth + email magic link); a Supabase Edge Function syncs PokéAPI data; Cloudflare Pages hosts the Vite SPA with a thin Pages-Functions BFF. The design satisfies every constitution v1.0.0 MUST principle (SEC-001…SEC-015).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node 20 LTS (tooling/CI), Deno (Supabase Edge runtime)

**Primary Dependencies**: React 18, Vite 5, TanStack Router, TanStack Query v5, Tailwind CSS, shadcn/ui (Radix), Zod, `@supabase/supabase-js`

**Storage**: Supabase Postgres (system of record). RLS on user-owned tables; reference tables read-only to client roles.

**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E smoke), axe-core (a11y), Lighthouse CI (budgets), pgTAP/policy tests (RLS cross-user denial)

**Target Platform**: Modern evergreen browsers (desktop/tablet/mobile); Cloudflare Pages edge

**Project Type**: pnpm-workspaces monorepo — web SPA + shared contracts package + Supabase (migrations/functions) + Cloudflare Pages Functions

**Performance Goals**: Search results < 1s (SC-004); all 151 render correctly across pagination; Lighthouse a11y/perf budgets pass

**Constraints**: Exactly 151 records; fixed page size 20; bearer-token auth (no cookies); CSP without script `unsafe-inline`/`unsafe-eval`; no `dangerouslySetInnerHTML`

**Scale/Scope**: Single user tier (no roles in MVP); ~151 Pokémon + curated Kanto map; 5 routes (landing, auth, browser, detail, map)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All 15 principles are addressed by design; none require a complexity exception. Summary (full traceability in [research.md](./research.md) and the conformance table in the implementation plan):

- **SEC-001/002/003** (auth gate, delegated auth, session expiry): TanStack Router `_protected` wrapper + Supabase OAuth/magic-link + short-lived tokens with refresh rotation. Authorization of record is RLS, not the client guard.
- **SEC-004** (RLS/IDOR): `ENABLE ROW LEVEL SECURITY` + `user_id = auth.uid()` policies on `profiles`/`user_preferences`(/`user_favorites`); policy tests prove cross-user denial.
- **SEC-005/006** (secret segregation, no credentials): anon key only in client (`VITE_`), service-role server-only, CI secret-scan; no password storage/hashing.
- **SEC-007/008** (input validation, parameterized): shared Zod schemas; sort allow-list; page clamp; Supabase query builder only.
- **SEC-009** (XSS): JSX escaping; `dangerouslySetInnerHTML` banned by lint.
- **SEC-010/011** (TLS, headers): Cloudflare always-HTTPS + HSTS; CSP/nosniff/frame-ancestors/Referrer-Policy via `_headers`; deploy smoke verifies.
- **SEC-012/013** (safe errors, logging hygiene): generic error mapping; Sentry `beforeSend` scrubbing; allow-listed analytics.
- **SEC-014** (secure sync): server-only, rate-limited, 151-record validation, `sync_runs`, curated coords never overwritten.
- **SEC-015** (CSRF, contextual): bearer tokens (no ambient cookies) → classic CSRF N/A; documented for future cookie-session amendment.

**Result: PASS** (initial and post-design). No entries in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-kanto-pokedex/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (query params, BFF, sync payload)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
kanto_pokedex/
├── pnpm-workspace.yaml
├── package.json                 # root scripts: dev, typecheck, lint, test, build
├── tsconfig.base.json
├── .github/workflows/
│   ├── ci.yml                   # typecheck, lint, test, build, secret-scan, Playwright smoke
│   └── deploy.yml               # production gate on merge to main
├── apps/web/
│   └── src/
│       ├── routes/              # __root, index (landing), auth, _protected/{pokedex, pokemon.$id, map}
│       ├── features/{auth,landing,pokedex,pokemon-detail,kanto-map}/
│       ├── components/ui/       # shadcn/ui primitives
│       └── lib/{supabase,queryKeys,sentry,analytics,errors}/
├── packages/shared/src/{schemas,types,constants}/
├── functions/api/               # Cloudflare Pages Functions: health.ts (+ optional pokemon/, map/)
├── supabase/
│   ├── migrations/              # reference tables, user tables+RLS, curated map, indexes
│   ├── seed/                    # curated kanto_locations + kanto_map_points + encounters
│   ├── functions/sync-pokeapi/  # Deno edge function
│   └── tests/                   # RLS policy tests
└── public/_headers              # Cloudflare security headers
```

**Structure Decision**: pnpm-workspaces monorepo (Option 2 "web application", adapted). The web SPA (`apps/web`), shared contracts (`packages/shared`), database/sync (`supabase/`), and edge BFF (`functions/`) are separate workspaces so the Zod contracts in `packages/shared` are the single source of truth shared by the browser, the BFF, and the sync function — directly supporting SEC-007.

## Complexity Tracking

> No constitution violations. Section intentionally empty.
