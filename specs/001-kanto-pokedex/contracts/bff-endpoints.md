# Contract: Cloudflare Pages Functions (BFF)

Thin backend-for-frontend at the edge. `/api/health` is the only day-one endpoint; `/api/pokemon` and `/api/map` are added **only if measured** to help payload shaping (per architecture). All DB access (if any) uses the Supabase query builder — no string-built SQL (SEC-008). All error responses are generic (SEC-012).

## `GET /api/health`

- **Auth**: none.
- **200** `{ "status": "ok", "time": "<ISO8601>" }`
- Used by the deploy smoke test and uptime checks. Does not touch user data.

## `GET /api/pokemon` *(optional, measured)*

- **Auth**: requires `Authorization: Bearer <access_token>`; the function validates the session via Supabase before responding (defense in depth; RLS remains the enforcement of record).
- **Query**: same schema as [browser-query](./browser-query.md), re-validated server-side.
- **200**: `{ items: BrowserCard[], page, pageSize: 20, total }`
- **400**: `{ error: "invalid_request" }` (generic) when validation fails.
- **401**: `{ error: "unauthenticated" }`.

## `GET /api/map` *(optional, measured)*

- **Auth**: bearer token, validated.
- **200**: `{ locations: KantoLocation[], points: MapPoint[], encounters: EncounterSummary[] }` where each encounter carries `confidence` + optional `method`.

## Error & header rules (all routes)

- Never echo Supabase/Postgres error text, stack traces, or internal IDs (SEC-012).
- Responses inherit the security headers from `_headers` (SEC-011).
- Logs scrub `Authorization` headers and tokens (SEC-013).
