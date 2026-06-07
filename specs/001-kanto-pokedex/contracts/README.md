# Contracts: Kanto Pokédex

These are the external-input and interface contracts for the feature. Each is implemented as a Zod schema in `packages/shared/src/schemas/` and consumed by the web app, the Cloudflare Pages Functions BFF, and the Supabase sync function. Validation at every trust boundary satisfies **SEC-007** (input validation) and **SEC-008** (parameterized access downstream).

Files:
- `browser-query.md` — Pokédex browser URL query params (search/filter/sort/page).
- `bff-endpoints.md` — Cloudflare Pages Functions HTTP contracts (`/api/health`, optional `/api/pokemon`, `/api/map`).
- `sync-payload.md` — PokéAPI payload validation + sync-run result contract.

Conventions:
- Sort keys are an **allow-list**, never free-form.
- Page size is a **fixed constant (20)**; `page` is clamped to `[1, maxPage]`.
- All string outputs are rendered as escaped text in the UI (**SEC-009**); contracts never carry HTML.
- Errors returned to clients are generic (**SEC-012**); detailed errors stay in server logs (scrubbed, **SEC-013**).
