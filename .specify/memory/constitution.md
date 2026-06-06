<!--
## Sync Impact Report
- Version change: (template) → 1.0.0
- Added sections: Threat Model (STRIDE-lite), Security Principles (SEC-001–SEC-015),
  Compliance Traceability Matrix, Governance
- Removed sections: N/A (initial population of template)
- Templates requiring updates:
  - .specify/templates/plan-template.md: "Constitution Check" section references
    principles dynamically — no update needed
  - .specify/templates/spec-template.md: no direct constitution references — no
    update needed
  - .specify/templates/tasks-template.md: no direct constitution references — no
    update needed
  - .specify/templates/commands/: directory does not exist — no update needed
- Follow-up TODOs: Fill in file:line in Compliance Traceability Matrix during
  /speckit-implement
-->

# Kanto Pokedex Security Constitution

**Version**: 1.0.0 | **Ratified**: 2026-06-06 | **Last Amended**: 2026-06-06

**Project**: Kanto Pokedex (Generation I Web Pokedex)
**Scope**: Non-negotiable security constraints governing all specification, planning, and
AI-assisted code generation for an authenticated, auth-gated Generation I Pokedex web
app backed by a managed identity/database provider, an edge host, and a synced public
Pokemon dataset.

Enforcement keywords (MUST / SHOULD / MAY) carry their RFC 2119 meaning. This
constitution specifies what must hold, not how to build it (technology choices live in
the plan). It is a security-critical artifact authored defensively (see Governance).

---

## Threat Model (STRIDE-lite)

### Assets

| ID | Asset | Sensitivity |
|----|-------|-------------|
| A1 | User accounts and sessions (managed-provider identities; session/access tokens) | High |
| A2 | Minimal profile and preference data (display name, avatar URL, UI preferences; Phase-2 favorites) | Low-Moderate (PII-light) |
| A3 | Supabase service-role key (bypasses RLS; full data access) | Critical |
| A4 | Integrity of the synced 151-Pokemon dataset and curated Kanto map/coordinate data | Moderate (integrity) |
| A5 | Availability of the application and its sync pipeline | Moderate |

### Trust Boundaries

| ID | Boundary |
|----|----------|
| TB1 | Browser to edge host (public internet) |
| TB2 | Client (anon key) to managed database/auth |
| TB3 | Server sync function to external public Pokemon API (untrusted inbound data) |
| TB4 | Unauthenticated to authenticated context (the auth gate) |
| TB5 | Client secret context (anon key) to server secret context (service-role key) |

### Top Threats per Boundary

| Boundary | STRIDE (primary) | Representative threat | Governing principle(s) |
|----------|-----------------|----------------------|------------------------|
| TB1 | Tampering, Info Disclosure | XSS via rendered untrusted text; clickjacking; TLS downgrade/interception | SEC-009, SEC-010, SEC-011 |
| TB2 | Elevation of Privilege, Info Disclosure | IDOR — a user reading/writing another user's profile/preferences/favorites; anon-key over-fetch | SEC-004, SEC-007 |
| TB3 | Tampering, Denial of Service | Poisoned/malformed sync payload; injection via flavor text; overwriting curated coordinates; wrong record count | SEC-007, SEC-008, SEC-009, SEC-014 |
| TB4 | Spoofing, Elevation of Privilege | Reaching the Pokedex with no valid session; stale/expired session reuse | SEC-001, SEC-002, SEC-003 |
| TB5 | Info Disclosure, Elevation of Privilege | Service-role key leaking into the client bundle or logs | SEC-005, SEC-013 |
| Cross-cutting | Denial of Service, Repudiation | Unthrottled sync/admin invocation; secrets/PII written to logs | SEC-013, SEC-014 |

---

## Core Principles

### Category I — Authentication & Session

#### SEC-001 — Authenticated access to protected areas

**CWE**: CWE-306 (Missing Authentication for Critical Function)
**Enforcement**: MUST

Every route and data view behind the auth gate (the entire Pokedex browser, detail
pages, the Kanto map, and any user-data read/write) MUST require a valid, non-expired
session. The public landing page is the only unauthenticated surface. There MUST be no
client-only gate that can be bypassed by navigating directly to a protected URL or
calling the data layer directly.

**Implementation pattern**: Enforce the session check at the route-guard layer for
navigation and, authoritatively, at the data layer via provider-enforced policies
(SEC-004). Client guards are UX; database policy is the enforcement of record.

**Rationale**: Without server-enforced authentication, attackers reach protected
functionality by direct URL or direct data calls, bypassing UI gating.

#### SEC-002 — Authentication integrity via the managed identity provider

**CWE**: CWE-287 (Improper Authentication)
**Enforcement**: MUST

Authentication MUST be delegated entirely to the managed identity provider's
OAuth/passwordless flows (Google, GitHub, and the configured fallback). The application
MUST NOT implement custom credential checks, custom token minting, or bypass paths.
OAuth scopes MUST be minimal (identity only).

**Implementation pattern**: Use the provider SDK's OAuth and session APIs; configure
provider apps with least-privilege scopes; verify session validity through the SDK, not
client-held flags.

**Rationale**: Hand-rolled authentication and excessive scopes are a leading source of
auth bypass and over-permissioned tokens.

#### SEC-003 — Session and token expiration

**CWE**: CWE-613 (Insufficient Session Expiration)
**Enforcement**: MUST

Sessions/access tokens MUST expire and rotate on a bounded schedule using the provider's
session configuration; expired sessions MUST be rejected and the user redirected to
re-authenticate. Indefinite client sessions MUST NOT be configured.

**Implementation pattern**: Configure short-lived access tokens with refresh rotation in
the provider's auth settings; rely on SDK auto-refresh plus expiry checks in route
guards; on refresh failure, clear local session state and redirect to auth.

**Rationale**: Long-lived or non-expiring sessions widen the window for stolen-token
reuse and session fixation.

### Category II — Authorization

#### SEC-004 — Row-Level Security on all user-owned data (IDOR prevention)

**CWE**: CWE-862 (Missing Authorization), CWE-863 (Incorrect Authorization)
**Enforcement**: MUST

Every user-owned table — `profiles`, `user_preferences`, and `user_favorites` (Phase 2)
— MUST have Row-Level Security enabled with policies restricting read and write to rows
owned by the authenticated user (ownership keyed to the auth user id). No user-owned
table may be exposed to the client with RLS disabled. Reference (public Pokemon/map)
tables MUST have explicit read policies and MUST NOT be writable by client roles.

**Implementation pattern**: In migrations, `ENABLE ROW LEVEL SECURITY` on each
user-owned table and define per-operation policies (SELECT/INSERT/UPDATE/DELETE)
asserting `user_id = auth.uid()`; add automated policy tests asserting cross-user
access is denied.

**Rationale**: Client-exposed data without ownership checks permits Insecure Direct
Object Reference — any authenticated user enumerating or mutating another user's rows.

### Category III — Secrets & Credentials

#### SEC-005 — Secret segregation (service-role key never reaches the client)

**CWE**: CWE-798 (Use of Hard-coded Credentials), CWE-522 (Insufficiently Protected Credentials)
**Enforcement**: MUST

The service-role key (and any other privileged secret) MUST NEVER be bundled,
referenced, or exposed in client-side code, browser-shipped environment variables, or
source control. The browser MUST use only the public anon key. All secrets MUST live in
platform secret stores (source-host CI secrets, edge-host environment, provider function
secrets) and MUST NOT be committed.

**Implementation pattern**: Only public-prefixed env vars (`VITE_`-style vars) reach the
client and contain only the anon key + public URL; the service-role key is injected
solely into server/edge runtimes via secret stores; a CI secret-scan step fails the
build if a service-role key pattern appears in the repo or client bundle.

**Rationale**: A leaked service-role key bypasses RLS and grants full data access;
hard-coded or client-exposed secrets are trivially extracted from bundles and history.

#### SEC-006 — No in-application credential storage (delegated credentials)

**CWE**: CWE-522 (Insufficiently Protected Credentials)
**Enforcement**: MUST

The application MUST NOT store, hash, or verify user passwords or other authentication
secrets itself. All credential storage and verification is delegated to the managed
identity provider. No password fields, password tables, or credential-hashing code may
exist in the application.

**Implementation pattern**: Use only the provider's OAuth/magic-link flows; persist only
a non-credential profile row (display name, avatar URL) keyed to the provider's user id.
There is no application password store, by construction.

**Rationale**: In-app credential handling reintroduces hashing/storage weaknesses the
managed provider already solves; the safest credential store is the one the app never
builds.

### Category IV — Input Validation & Injection

#### SEC-007 — Strict validation of all external input, with bounded pagination

**CWE**: CWE-20 (Improper Input Validation)
**Enforcement**: MUST

All external input MUST be validated and normalized against strict schemas before use —
browser query parameters (search term, type filter, sort key, page/page-size) and all
inbound sync payloads. Sort keys MUST be constrained to an allow-list (`number`, `name`,
`base-stat-total`). Pagination size MUST be bounded to a fixed maximum; out-of-range or
malformed values MUST be rejected or clamped to safe defaults, never passed through
unbounded.

**Implementation pattern**: Define shared validation schemas (one library, reused client
and server) for query params and sync payloads; parse-and-reject at the boundary; encode
the sort allow-list and max page size as constants; reject unknown enum values.

**Rationale**: Unvalidated input drives injection, resource exhaustion (huge page sizes),
and logic errors; an allow-listed, bounded surface eliminates whole classes of abuse.

#### SEC-008 — Parameterized data access (no string-built queries)

**CWE**: CWE-89 (SQL Injection)
**Enforcement**: MUST

All database access from edge/server functions MUST use the provider's query builder or
parameterized statements/RPC. String-concatenated or interpolated SQL/RPC built from
external input is PROHIBITED.

**Implementation pattern**: Use the provider client's typed query/filter builder for
reads and writes; for any raw RPC, pass arguments as bound parameters; forbid
template-string SQL in review and, where feasible, via lint rules.

**Rationale**: Concatenating input into queries is the canonical SQL-injection vector;
parameterization makes input data, not executable code.

### Category V — Output & Rendering

#### SEC-009 — Output encoding / XSS prevention; external text is untrusted

**CWE**: CWE-79 (Improper Neutralization of Input During Web Page Generation — XSS)
**Enforcement**: MUST

The application MUST rely on the rendering framework's automatic output escaping for all
dynamic content. Raw-HTML injection (`dangerouslySetInnerHTML` or equivalent) is
PROHIBITED. Externally-sourced strings — Pokemon flavor text, ability/effect text, and
curated map/location notes — MUST be treated as untrusted and rendered only as escaped
text, never as markup.

**Implementation pattern**: Render all dynamic strings as escaped text children; introduce
no raw-HTML sinks; if rich text is ever required, route it through a vetted sanitizer
behind an explicit amendment; add a lint rule forbidding raw-HTML props.

**Rationale**: Injecting untrusted strings as HTML enables stored/reflected XSS;
framework auto-escaping neutralizes this by default, and the ban on raw-HTML sinks keeps
it that way.

### Category VI — Transport & Headers

#### SEC-010 — Encrypted transport (TLS 1.2+)

**CWE**: CWE-319 (Cleartext Transmission of Sensitive Information)
**Enforcement**: MUST

All traffic (browser to edge host and onward to provider services) MUST use TLS 1.2 or
higher. Plaintext HTTP MUST be redirected to HTTPS; mixed-content requests MUST NOT be
issued.

**Implementation pattern**: Enable always-use-HTTPS / automatic HTTPS at the edge host;
set HSTS via response headers (SEC-011); ensure all asset and API URLs are HTTPS.

**Rationale**: Cleartext transmission exposes sessions and tokens to interception and
downgrade attacks.

#### SEC-011 — Security headers and Content Security Policy at the edge

**CWE**: CWE-693 (Protection Mechanism Failure); CSP also mitigates CWE-79 and
frame-based clickjacking (CWE-1021)
**Enforcement**: MUST

The edge host MUST serve a baseline security header set on all responses: a
Content-Security-Policy restricting script/style/connect/img/frame sources to known
origins, `X-Content-Type-Options: nosniff`, a restrictive `frame-ancestors`/
`X-Frame-Options`, `Referrer-Policy`, and HSTS. CSP MUST NOT include
`unsafe-inline`/`unsafe-eval` for scripts unless justified by an explicit amendment.

**Implementation pattern**: Configure headers via the edge host's static `_headers` file
and/or Pages-Functions middleware; pin `connect-src` to the provider's API/auth origins
and `img-src` to allowed image origins; validate headers in the deploy smoke test.

**Rationale**: Absent headers and a permissive CSP leave XSS, clickjacking, and
MIME-sniffing mitigations off, weakening every other rendering protection.

### Category VII — Error Handling & Logging

#### SEC-012 — Safe error handling (no information exposure)

**CWE**: CWE-200 (Exposure of Sensitive Information), CWE-209 (Generation of Error
Message Containing Sensitive Information)
**Enforcement**: MUST

User-facing errors MUST be generic and actionable; they MUST NOT expose stack traces,
secrets, keys, raw provider/database error text, internal identifiers, or query details.
Detailed diagnostics MAY be sent to server-side observability only, subject to SEC-013.

**Implementation pattern**: Map all caught errors to safe, user-facing messages at the
API/BFF and UI boundary; log the detailed (scrubbed) error server-side; never render raw
error objects to the user.

**Rationale**: Verbose errors leak implementation details (schema names, internal paths,
key fragments) that accelerate attacks.

#### SEC-013 — Logging and telemetry hygiene

**CWE**: CWE-532 (Insertion of Sensitive Information into Log File)
**Enforcement**: MUST

Logs, error-tracking events, and analytics events MUST NOT contain access/refresh
tokens, secrets, the service-role key, full credentials, or unnecessary PII. Analytics
events MUST be limited to the defined non-identifying event set.

**Implementation pattern**: Configure the error tracker with `beforeSend` scrubbing and
PII filtering; emit only allow-listed fields; redact authorization headers and tokens in
function logging; review the analytics event list against this constraint.

**Rationale**: Logs are frequently lower-trust stores; secrets or PII written there
become an easy exfiltration target and a compliance problem.

### Category VIII — Data Sync Integrity & Admin Surface

#### SEC-014 — Server-only, rate-limited, integrity-checked data sync

**CWE**: CWE-862 (Missing Authorization), CWE-770 (Allocation of Resources Without
Limits or Throttling), CWE-345 (Insufficient Verification of Data Authenticity)
**Enforcement**: MUST

The Pokemon-data sync MUST run only in a server/admin context (provider edge function or
admin-triggered job); it MUST NOT be invocable by unauthenticated or ordinary
authenticated clients. Sync and any admin/sync-trigger endpoints MUST be rate-limited.
Each run MUST validate that exactly 151 records with required fields are present before
being marked successful, MUST record status in `sync_runs`, and MUST NOT overwrite
curated Kanto coordinates (`kanto_locations` / `kanto_map_points`) — provider sync
updates provider-sourced fields only.

**Implementation pattern**: Implement sync as a server-side function invoked by schedule
or admin trigger using the service-role key (server-only per SEC-005); gate/rate-limit
the trigger; run data-quality checks (count = 151, required fields,
encounter-confidence populated) and fail the run on violation; scope upserts to
provider-owned columns and exclude curated coordinate tables from write paths.

**Rationale**: An open or unthrottled sync endpoint invites resource exhaustion and data
poisoning; integrity checks and curated-data protection preserve the dataset users
depend on.

### Category IX — CSRF (Contextual)

#### SEC-015 — Cross-Site Request Forgery (contextual)

**CWE**: CWE-352 (Cross-Site Request Forgery)
**Enforcement**: SHOULD (conditional MUST)

Because authenticated requests use bearer tokens in the Authorization header (not ambient
cookies), classic CSRF does not apply to the MVP's state-changing calls. The application
SHOULD keep authentication token-based rather than cookie-based. IF a cookie-based
session is ever introduced for any state-changing operation, anti-CSRF protection
(SameSite cookies plus per-request CSRF tokens or the double-submit pattern) MUST be
added at that time, and this principle's enforcement becomes MUST.

**Implementation pattern**: Send the session as an `Authorization: Bearer` header via
the provider SDK; avoid cookie-based mutation endpoints; revisit under amendment if
cookie sessions are adopted.

**Rationale**: CSRF exploits ambient credentials (cookies) that the browser auto-attaches;
bearer-token headers are not auto-attached cross-site, so the risk is contextual rather
than present in the current design.

---

## Not Applicable Principles

Recording these prevents silent gaps (constitution completeness).

- **In-application password hashing** — Not applicable. The app stores no passwords;
  credential handling is delegated to the managed identity provider (SEC-006).
  Implementing in-app hashing would invent a credential store the product must not have.
- **Financial precision / integer-overflow controls** — Not applicable. The app processes
  no monetary or precision-sensitive arithmetic. Numeric fields (stats, levels,
  coordinates) are bounded small integers/decimals from a validated source.
- **Broad encryption-at-rest** — Not applicable as a distinct app principle. The app
  persists only minimal, low-sensitivity profile/preference data; storage-layer
  encryption is provided by the managed database platform. Revisit if sensitive personal
  data is ever introduced.

---

## Compliance Traceability Matrix

Status is Pending until implementation; file:line is filled in during `/speckit-implement`.

| Principle | CWE | Planned file/module | Technique | Status |
|-----------|-----|---------------------|-----------|--------|
| SEC-001 Auth-gated access | 306 | `apps/web/src/features/auth/`, `apps/web/src/routes/` (guards) | Session-checked route guards + DB policy enforcement | Pending |
| SEC-002 Auth integrity | 287 | `apps/web/src/features/auth/`, `apps/web/src/lib/supabase/` | Provider OAuth/session SDK; minimal scopes | Pending |
| SEC-003 Session expiration | 613 | Provider auth session config; `apps/web/src/lib/supabase/` | Short-lived tokens + refresh rotation; expiry-aware guards | Pending |
| SEC-004 RLS / IDOR | 862, 863 | `supabase/migrations/` (policies); `supabase/tests/` | RLS enabled + per-user policies; cross-user denial tests | Pending |
| SEC-005 Secret segregation | 798, 522 | CI/edge/provider secret stores; `apps/web` env; `.github/workflows/ci.yml` | Service-role key server-only; bundle secret-scan gate | Pending |
| SEC-006 No in-app credentials | 522 | (No module — enforced by absence) | Delegated credentials; no password store | Pending |
| SEC-007 Input validation + bounded pagination | 20 | `packages/shared/src/schemas/`; `apps/web/src/features/pokedex/`; `supabase/functions/sync-pokeapi/` | Shared schemas; sort allow-list; max page-size constant | Pending |
| SEC-008 Parameterized access | 89 | `supabase/functions/sync-pokeapi/`; `functions/api/` | Provider query builder / bound RPC params | Pending |
| SEC-009 XSS / output encoding | 79 | `apps/web/src/features/pokemon-detail/`, `kanto-map/`, `components/` | JSX auto-escaping; no raw-HTML sink; lint rule | Pending |
| SEC-010 TLS 1.2+ | 319 | Edge-host TLS config; `apps/web/public/_headers` (HSTS) | Always-HTTPS + HSTS | Pending |
| SEC-011 Headers / CSP | 693 (1021) | `apps/web/public/_headers` and/or `functions/_middleware.ts` | CSP, nosniff, frame-ancestors, Referrer-Policy, HSTS | Pending |
| SEC-012 Safe errors | 200, 209 | `apps/web/src/lib/api/`; `functions/api/` | Generic user errors; server-side detail only | Pending |
| SEC-013 Logging hygiene | 532 | `apps/web/src/lib/analytics/` (Sentry `beforeSend`); `supabase/functions/sync-pokeapi/` | Token/PII scrubbing; allow-listed events | Pending |
| SEC-014 Secure sync/admin | 862, 770 (345) | `supabase/functions/sync-pokeapi/`; `scripts/validate-pokemon-data.ts` | Server-only + rate limit; 151-count validation; curated-coord protection | Pending |
| SEC-015 CSRF (contextual) | 352 | (No module currently — bearer-token design) | `Authorization: Bearer`; conditional anti-CSRF | N/A (conditional) |

---

## Governance

### Versioning (Semantic Versioning)

- **MAJOR** (x.0.0): removing a principle, downgrading a MUST to SHOULD/MAY, or any
  change that reduces a security guarantee.
- **MINOR** (1.x.0): adding a new principle or strengthening an existing one
  (e.g., SHOULD to MUST); backward-compatible.
- **PATCH** (1.0.x): clarifications, rationale/wording edits, or traceability-matrix
  updates (including filling file:line at implementation) that change no constraint.

### Amendment Procedure

1. Propose the change as a pull request that edits this file and the traceability matrix
   together.
2. Security review by at least one reviewer other than the author; the PR MUST state the
   threat-model impact and the resulting version bump.
3. On merge, bump the version per the versioning policy and add a brief changelog entry
   (date, version, summary).
4. Downstream artifacts (specify / plan / tasks) MUST be reconciled with the amended
   constitution before implementation continues.

### Defensive Authoring (anti prompt-injection / spec-poisoning)

This constitution is a security-critical artifact, authored defensively:

- Principles use unambiguous, declarative MUST/SHOULD/MAY language that cannot be
  reinterpreted through injected context.
- There are no conditional-override or user-controlled exception clauses that could
  weaken a constraint. The only conditional (SEC-015) strengthens enforcement when a
  cookie session is introduced.
- External/untrusted content (Pokemon flavor text, curated notes, sync payloads) is
  explicitly designated untrusted (SEC-007, SEC-009) and is never treated as
  instructions.
- This file is change-controlled (Amendment Procedure): treat it with the same review
  and integrity rigor as production deployment configuration. Reject any edit that
  introduces an override path or relaxes a MUST without an explicit, reviewed MAJOR
  amendment.

**Version**: 1.0.0 | **Ratified**: 2026-06-06 | **Last Amended**: 2026-06-06
