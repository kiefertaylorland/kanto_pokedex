# Phase 0 Research: Kanto Pokédex

All Technical Context items were resolved from the provided architecture, `docs/06-technical-specification.md`, and `docs/08-recommended-architecture-decisions.md`. No `NEEDS CLARIFICATION` markers remain.

## D1 — Hosting & data platform: Supabase + Cloudflare Pages
- **Decision**: Supabase (Postgres + Auth + Edge Functions) as system of record; Cloudflare Pages for the SPA + thin Pages Functions BFF.
- **Rationale**: Managed Auth (OAuth + magic link) removes all credential handling (SEC-002/006); Postgres RLS gives authorization-of-record at the database (SEC-001/004); Cloudflare Pages gives free per-PR preview deploys and edge headers (SEC-010/011). Data volume (151 records) is tiny, so no separate API server is needed.
- **Alternatives**: Next.js + Vercel (more full-stack than needed; SSR not required for a gated SPA); self-hosted Postgres + custom auth (rejected — would force in-app credential handling, violating SEC-006); Firebase (weaker relational modeling for normalized Pokémon data).

## D2 — Routing: TanStack Router
- **Decision**: TanStack Router with a `_protected` layout route wrapping browser/detail/map; landing + auth are public.
- **Rationale**: Type-safe routes and search-param schemas pair naturally with Zod-validated URL state (SEC-007, FR-014). `beforeLoad` guards redirect unauthenticated/expired sessions (SEC-001/003). Client guard is UX only; RLS is enforcement.
- **Alternatives**: React Router (less type-safe search params); file-based Next routing (rejected with D1).

## D3 — Server state: TanStack Query v5
- **Decision**: TanStack Query for caching, loading/error/retry, and invalidation, with a centralized query-key factory in `lib/queryKeys`.
- **Rationale**: Directly satisfies FR-015/FR-034 (loading/empty/error states) and SC-004 (sub-1s search via cache); disciplined keys avoid cache leaks across filter combinations.
- **Alternatives**: Redux Toolkit Query (heavier); manual `useEffect` fetching (no caching/retry discipline).

## D4 — UI primitives: shadcn/ui (Radix + Tailwind)
- **Decision**: shadcn/ui generated components in `components/ui`, themed for a retro Pokédex aesthetic.
- **Rationale**: Accessible Radix primitives (dialogs/popovers/menus) satisfy keyboard + WCAG 2.1 AA goals (SC-010, FR-036/037); copy-in ownership avoids opaque dependency styling; Tailwind keeps contrast tokens explicit.
- **Alternatives**: Raw Radix (more manual styling); MUI/Chakra (heavier runtime, harder to theme retro).

## D5 — Validation: Zod in a shared package
- **Decision**: All external input (URL query params, BFF input, PokéAPI sync payloads) validated by Zod schemas in `packages/shared`, consumed by web + BFF + sync.
- **Rationale**: One source of truth for SEC-007 — sort keys allow-listed to `number|name|base_stat_total`; page size clamped to 20; numeric search constrained to 1–151. Inferred TS types prevent drift.
- **Alternatives**: ad-hoc per-call validation (drift risk); io-ts/Yup (Zod has best TS inference + ecosystem fit).

## D6 — Kanto map rendering: in-code SVG
- **Decision**: Retro-inspired SVG authored in React; markers positioned from `kanto_map_points` coordinates; fixed `viewBox` scaled to fit, no pan/zoom.
- **Rationale**: Accessible (focusable `<a>`/`<button>` markers), responsive, clickable, no external asset dependency (Assumption + FR-027/033). Matches `docs/06` §9 recommendation.
- **Alternatives**: Canvas (less accessible by default); tile-map engine (over-engineered); static image overlay (asset risk, less flexible).

## D7 — Data sync: scheduled server-only Edge Function
- **Decision**: `sync-pokeapi` Deno Edge Function invoked with the service-role key; scheduled weekly (pg_cron / scheduled function) and manually runnable; rate-limited at trigger.
- **Rationale**: SEC-014 — server-only, not client-invocable; validates exactly 151 records with required fields before `success`; writes only provider-sourced fields (never curated coordinates); records every run in `sync_runs`. Upserts by stable PokeAPI IDs; stores `raw_payload` jsonb for traceability.
- **Alternatives**: Client-triggered sync (rejected — violates SEC-014); runtime PokéAPI calls from browser (rejected — breaks offline-of-provider edge case + CSP `connect-src` pinning).

## D8 — Secret segregation & CI secret-scan
- **Decision**: Browser receives only `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Service-role key lives only in Supabase function secrets / CI secret store. A CI step greps repo + built client bundle for service-role key patterns and JWT `role:"service_role"` and fails on match.
- **Rationale**: SEC-005. `VITE_` prefix is the only client-exposed surface in Vite, making the boundary auditable.
- **Alternatives**: trusting convention only (rejected — no enforcement).

## D9 — Security headers via Cloudflare `_headers`
- **Decision**: Static `public/_headers` (with Pages-Functions middleware fallback) sets CSP (`default-src 'self'`; `connect-src` pinned to the Supabase project origin + `*.supabase.co`; `img-src` pinned to PokéAPI sprite/raw.githubusercontent image origins; no script `unsafe-inline`/`unsafe-eval`), `X-Content-Type-Options: nosniff`, `frame-ancestors 'none'`/`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS.
- **Rationale**: SEC-010/011. Deploy smoke test asserts headers present.
- **Alternatives**: per-response header code (more error-prone than a single `_headers` manifest).

## D10 — CSRF posture (SEC-015)
- **Decision**: Authenticated requests carry `Authorization: Bearer <access_token>`; no ambient session cookies. Classic CSRF does not apply to the MVP.
- **Rationale**: Supabase JS stores the session in `localStorage` and attaches a bearer header, so cross-site requests cannot ride an implicit cookie. Documented so that introducing any cookie-based session later triggers the conditional MUST (SameSite + CSRF tokens).

## D11 — Observability
- **Decision**: Sentry (frontend + edge) with `beforeSend` scrubbing tokens/PII; Cloudflare Web Analytics with an allow-listed, non-identifying event set; Supabase logs; alert on a failed `sync_runs` row.
- **Rationale**: SEC-013. Keeps logs free of access/refresh tokens, service-role key, and unnecessary PII.
