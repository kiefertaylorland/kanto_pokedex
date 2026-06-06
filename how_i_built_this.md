# Temp Notes

## Table of Contents

- [How I Started]()
    - [The Initial Prompt](#the-initial-prompt)
    - [The Improved Prompt](#the-improved-prompt)
- [Creating a Complete SDLC Plan for the App](#creating-a-complete-sdlc-plan-for-the-app)
    - [ChatGPT's Response](#chatgpts-response)
- [Using Claude Cowork to Create Spec Kit Scaffold](#using-claude-cowork-to-create-spec-kit-scaffold)
    - [Claude Cowork Setup](#claude-cowork-setup)
    - [Claude Cowork Prompt Engineering Session](#claude-cowork-prompt-engineering-session)
        - [Input](#input)
        - [Output](#output)
- [Scaffolding the GitHub Repo](#scaffolding-the-github-repo)

## How I Started

### The Initial Prompt

Using the [`Prompt Engineering`](https://chatgpt.com/g/g-bNiLAvz8R-prompt-engineeringA) custom GPT in ChatGPT, I was able to transform my initial prompt into from this:

``` markdown
Improve my prompt:

I want to create an app that is an emulator of the Pokédex containing the original 151 Pokémon. 

There should be a landing page screen with a CTA. 

There should be a signup/login page that allows user to sign up and login with Gmail SSO, GitHub SSO, and other major login providers. 

There should be a screen that allows a user to browse all 151 Pokémon.

There should be a screen that displays a selected  Pokémon’s details when a user selects a Pokémon from the Pokédex browser screen. 

There should be a screen that displays a map of the Kanto region from Pokémon red and blue and where each Pokémon in the Pokédex can be found. 

As I user I want to be able to create an account. 

As a user I want to be able to login and logout of my account. 

As a user I want to browse Pokémon in the Pokédex 

As a user I want to see Pokémon details and data when making a selection in the Pokédex. 

As a user I want to see a map of the Kanto region and where each Pokémon is located. 

We should be able to leverage the PokeAPI to gather data. 

I need assistance working through each phase of the SDLC.  

I need to create some artifacts as well:

PRD 
BRD
Tech Spec
Data Model

I would like to leverage supabase, cloudflare, and GitHub and any other recommendations you may have. 
```

### The Improved Prompt

``` markdown
You are a senior product strategist, solutions architect, and technical program manager. Help me plan and deliver a web app that emulates a Pokédex featuring the original 151 Pokémon from Generation I. Use the PokeAPI as the primary external data source where appropriate. Base your guidance on modern, practical product and engineering best practices. Take your time, think step by step, and check your work before responding.  

Objective

Create a complete SDLC plan for a Pokédex application with product, business, technical, and data deliverables. The app should be feasible for real-world implementation and should include clear recommendations for architecture, tooling, and phased execution.  

Product Scope

The application must include the following screens and capabilities:

Core Screens

1. Landing Page
    * A polished landing page that explains the product value.
    * Include a clear CTA such as “Get Started” or “Open Pokédex.”
2. Authentication Page
    * Support sign up, login, and logout.
    * Support major identity providers, including:
        * Gmail / Google SSO
        * GitHub SSO
        * Other major providers you recommend
    * Explain the tradeoffs of the recommended auth options.
3. Pokédex Browser Screen
    * Allow users to browse all original 151 Pokémon.
    * Include useful browsing features such as search, filter, sort, pagination or infinite scroll, and basic Pokémon cards.
4. Pokémon Detail Screen
    * When a user selects a Pokémon, show a detailed profile.
    * Include relevant data such as name, Pokédex number, types, stats, abilities, sprites/artwork, evolution information if available, and location data if appropriate.
5. Kanto Map Screen
    * Display a map of the Kanto region inspired by Pokémon Red and Blue.
    * Show where each Pokémon can be found.
    * If exact canonical location mapping is difficult or inconsistent through PokeAPI alone, explain how to handle this through a supplemental dataset, assumptions, or a custom mapping layer.

User Stories

Use and refine the following user stories:

* As a user, I want to create an account.
* As a user, I want to log in and log out of my account.
* As a user, I want to browse Pokémon in the Pokédex.
* As a user, I want to view Pokémon details and data after selecting a Pokémon.
* As a user, I want to see a map of the Kanto region and where each Pokémon is located.

Technology Preferences

I would like to leverage:

* Supabase
* Cloudflare
* GitHub

You may recommend additional technologies where helpful, but you must justify each recommendation in terms of:

* purpose
* benefits
* tradeoffs
* cost/complexity impact

What I Need From You

Guide me through each phase of the SDLC and produce the following artifacts:

1. BRD (Business Requirements Document)
2. PRD (Product Requirements Document)
3. Technical Specification
4. Data Model

Required Approach

Structure your response in phases and cover the full SDLC:

1. Discovery and problem framing
2. Requirements gathering
3. Product definition
4. Solution architecture
5. Data design
6. UX/UI planning
7. Implementation planning
8. Testing and QA strategy
9. Deployment and release strategy
10. Post-launch operations and future roadmap

Deliverables

Provide all output in the following structure:

1. Executive Summary

* Summarize the product concept, audience, value proposition, and recommended solution approach.

2. Assumptions and Open Questions

* List assumptions you are making.
* List open questions that should be answered before development begins.
*All assumptions and open questions MUST be answered before you generate any output artifacts or documents. 

3. SDLC Plan

For each SDLC phase, provide:

* goals
* key activities
* stakeholders
* deliverables
* risks
* recommended tools/services

4. BRD

Write a concise but realistic BRD that includes:

* business objective
* problem statement
* goals and success metrics
* stakeholders
* scope
* constraints
* risks
* business requirements

5. PRD

Write a detailed PRD that includes:

* product vision
* target users
* user journeys
* user stories
* functional requirements
* non-functional requirements
* MVP scope
* out-of-scope items
* acceptance criteria for each major feature

6. Technical Specification

Create a technical specification that includes:

* proposed system architecture
* frontend stack
* backend/services stack
* authentication approach
* database/storage approach
* API integration strategy with PokeAPI
* caching/performance strategy
* map/location strategy
* security considerations
* observability/monitoring
* CI/CD workflow using GitHub
* Cloudflare and Supabase responsibilities
* recommended folder or repo structure

7. Data Model

Create a logical data model with:

* entities
* attributes
* relationships
* which data should come from PokeAPI
* which data should be stored locally
* which data should be user-specific
* notes on sync, caching, and data freshness

8. Recommended Architecture Decisions

Provide a table with:

* decision
* recommendation
* rationale
* alternatives considered
* tradeoffs

9. Delivery Roadmap

Provide a phased roadmap:

* Phase 0: discovery and setup
* Phase 1: MVP
* Phase 2: enhanced experience
* Phase 3: scale and polish

For each phase include:

* key features
* technical milestones
* artifacts produced

10. Next Steps

End with a practical, prioritized action plan for what I should do first.

Output Requirements

* Be specific and actionable.
* Use clear headings.
* Use tables where useful.
* Avoid vague generic advice.
* When requirements are ambiguous, state assumptions explicitly.
* Highlight any areas where canonical Pokémon location data may need custom handling beyond PokeAPI.
* Make recommendations that are appropriate for a modern startup-style web app.
* Keep the response grounded in realistic implementation detail.
* Use the second person (“you”).
* Where useful, suggest alternative implementation options for MVP versus production-ready architecture.  

Optional Enhancement

Where appropriate, apply these prompt patterns:

* Persona Pattern for expert guidance
* Recipe Pattern for phased execution
* Template Pattern for structured artifact generation
* Alternative Approaches Pattern when comparing stack or architecture choices
* Reflection Pattern to validate recommendations and identify risks
```

---

## Creating a complete SDLC plan for the app

I then used the new and improved prompt to walk me through the Software Development Life Cycle to produce the following artifacts:

```markdown
- BRD
- PRD
- Technical Specification
- Data Model
```

The revised prompt requests the response be structured in the following phases:

```markdown
1. Discovery and problem framing 
2. Requirements gathering 
3. Product definition 
4. Solution architecture 
5. Data design 
6. UX/UI planning 
7. Implementation planning 
8. Testing and QA strategy 
9. Deployment and release strategy 
10. Post-launch operations and future roadmap
```

### ChatGPT's response

ChatGPT responded with the requested docs and output each phase into a separate markdown file which can be found in the `docs/` directory.

## Using Claude Cowork to Create Spec Kit Scaffold

GitHub Spec Kit uses the following commands to initialize, setup, and scaffold your application:

- `/speckit-constitution` - to create the project's constitution which establishes the non-negotiable rules, architectural boundaries, and coding standards that AI agents must read and obey before generating any plans or implementation code.
- `/speckit-specify` - allows the developer to provide the application's functional specifications and requirements
- `/speckit-clarify` -  clarify any of the requirements that were not captured properly within the first shot attempt. Run the structured clarification workflow before creating a technical plan to reduce rework downstream.
- `/speckit-plan` - allows the developer to provide a tech stack and other technical requirements.

I used Claude Cowork to assist with developing a secure `constitution.md` and provide the prompts for `/speckit-specify` and `/speckit-plan`.

`speckit-clarify` was used to surface any ambiguities in the `docs/` files.

### Claude Cowork Setup

In Claude Cowork, I created a new project titled **`Kanto Pokedex`** and added the 10 markdown files to the project along with **[Constitutional Spec-Driven Development: Enforcing Security by Construction in AI-Assisted Code Generation](https://arxiv.org/pdf/2602.02584)**.

### Claude Cowork Prompt Engineering Session

Using a custom skill I created for prompt engineering based on Anthropic's prompt engineering best practices called `/prompt-improver` I was able to take my original prompt and improve it.

#### Input

```markdown
/prompt-improver improve my prompt:

"I want to build a pokedex website use github spec kit https://github.github.com/spec-kit/index.html read the additional files in the claude cowork workspace to gain all the context needed for the pokedex appication. Based on the Constitutional SpecDriven Development Enforcing Security PDF create the constitution.md file for the Pokedex app that aligns with the pokedex security concerns and threat modeling. additionally, based on the project files, create the prompts i can use with the following speckit commands:

- `/speckit.specify`
- `/speckit.plan`
```

#### Output

``` markdown
ROLE & CONTEXT
You are a security-conscious senior engineer kicking off a Pokédex web app with GitHub Spec Kit
(Spec-Driven Development). Spec Kit’s flow is:
/speckit.constitution → /speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement.
Honor the phase split strictly: SPECIFY captures WHAT and WHY (no tech stack); PLAN captures HOW
(tech stack + architecture). If anything is ambiguous, state your assumption briefly before writing.

Read these workspace files first and treat them as the source of truth:

PRODUCT scope: 01-executive-summary.md, 04-brd-business-requirements-document.md,
05-prd-product-requirements-document.md
TECHNICAL: 06-technical-specification.md, 07-data-model.md,
08-recommended-architecture-decisions.md,
02-assumptions-open-questions-resolved.md, 03-sdlc-plan.md,
09-delivery-roadmap.md, 10-next-steps.md
METHOD/FORMAT: Constitutional_SpecDriven_Development_…_Code_Generation.pdf
Produce THREE deliverables.

────────────────────────────────────────────────────────
DELIVERABLE 1 — constitution.md (security constitution)
────────────────────────────────────────────────────────
Apply the PDF’s METHODOLOGY and PRINCIPLE FORMAT, but ADAPT to this app’s real threat model.
Do NOT copy the banking principles verbatim — the PDF’s example is a bank, and several of its
principles don’t apply here (copying them would invent components this app shouldn’t have).

Structure:

Header — project name, version (start 1.0.0, semver), ratification date, one-line scope.
Threat model (STRIDE-lite, brief):
Assets: user accounts/sessions; minimal profile data; the Supabase SERVICE-ROLE key;
integrity of the synced 151-Pokémon dataset; availability.
Trust boundaries: browser ↔ Cloudflare ↔ Supabase ↔ PokeAPI; unauthenticated vs
authenticated; client (anon key) vs server (service-role key).
Top threats per boundary.
Principles — each in the PDF’s 6-field format: Identifier (SEC-001…), CWE reference,
Enforcement (MUST/SHOULD/MAY per RFC 2119), Constraint, Implementation pattern,
Rationale (attack vector). Cover at least:
Auth via Supabase Auth; protected routes require a valid session (CWE-306, CWE-287).
Session/token expiration via Supabase session config (CWE-613).
Authorization/RLS: every user-owned table (profiles, user_preferences, user_favorites)
MUST enable RLS enforcing per-user ownership; prevent IDOR (CWE-862/863).
Secrets: service-role key MUST never reach the client bundle; client uses anon key only;
secrets live in GitHub/Cloudflare/Supabase secret stores (CWE-798, CWE-522).
NOTE: the app delegates credential storage to Supabase Auth and MUST NOT store passwords
itself — this replaces the PDF’s in-app bcrypt principle.
Input validation: validate/sanitize all external input (search, filter, sort, pagination,
PokeAPI sync payloads) with Zod; bound pagination size (CWE-20).
Injection: any SQL/RPC in edge functions MUST be parameterized; no string-built queries (CWE-89).
Output encoding/XSS: rely on JSX auto-escaping; dangerouslySetInnerHTML is PROHIBITED;
treat PokeAPI flavor text and curated notes as untrusted on render (CWE-79).
Transport: all traffic over TLS 1.2+ via Cloudflare (CWE-319).
Security headers/CSP configured at Cloudflare.
Error handling/info exposure: user-facing errors MUST NOT leak stack traces, keys, or
Supabase internals (CWE-200/209).
Logging: logs and Sentry events MUST NOT contain tokens, secrets, or unnecessary PII (CWE-532).
Sync/admin endpoints: PokeAPI sync MUST be server/admin-only and rate-limited; MUST validate
151 records; MUST NOT overwrite curated Kanto coordinates.
CSRF (CWE-352): contextualize — Supabase uses bearer tokens; document where anti-CSRF applies
only if a cookie-based session is ever introduced.
For any PDF principle that does NOT apply here (in-app password hashing; financial
Decimal/integer-overflow precision; broad encryption-at-rest of sensitive data), add a short
"Not applicable — " entry rather than silently dropping it.
Compliance Traceability Matrix — table: Principle | CWE | Planned file/module | Technique | Status
(file:line filled during implementation).
Governance — semantic versioning + amendment procedure; a note that the constitution is a
security-critical artifact authored defensively (unambiguous, declarative; no user-controlled
override clauses) to resist prompt injection / spec poisoning (PDF Lesson 4 / Limitation 5).
Output the full file content (the text I can pass to /speckit.constitution or drop into the
constitution file Spec Kit created).

────────────────────────────────────────────────────────
DELIVERABLE 2 — the /speckit.specify prompt (one copyable block)
────────────────────────────────────────────────────────
A single natural-language description of WHAT to build and WHY, grounded in the BRD/PRD.
NO framework, database, or API names — those belong in PLAN. Include:

The product, its value, and target users.
Landing page with value prop + CTA.
Auth gating: landing public; Pokédex requires sign up / login / logout; unauthenticated users
redirect to auth.
Browser of the original 151: search by name/number, filter by type, sort (number/name/
base-stat-total), pagination; cards show number, name, sprite/artwork, types.
Detail page: types, base stats, abilities (incl. hidden), height/weight, artwork, evolution
chain, location summary.
Kanto-inspired map: clickable markers, encounter panels listing Pokémon, a source/confidence
label per encounter (pokeapi / curated / inferred / unknown), panel→detail links, mobile support.
Transparency about curated vs inferred location data.
Loading/empty/error states; responsive desktop/tablet/mobile; keyboard-accessible, adequate contrast.
Acceptance-style success criteria.
OUT OF SCOPE: battle simulator, team builder, trading, generations beyond Gen I, full move
database, monetization, favorites (Phase 2).
────────────────────────────────────────────────────────
DELIVERABLE 3 — the /speckit.plan prompt (one copyable block)
────────────────────────────────────────────────────────
The HOW: tech stack + architecture, grounded in the technical spec, data model, and ADRs, and
explicitly conforming to EVERY MUST in constitution.md. Include:

Frontend: React + TypeScript + Vite SPA; TanStack Router; TanStack Query; Tailwind CSS;
Radix UI or shadcn/ui; Zod.
Data/backend: Supabase Postgres (system of record) + Supabase Auth (Google, GitHub, email
magic-link/Apple fallback) + RLS on user-owned tables + Supabase Edge Function for PokeAPI sync
(manual + weekly scheduled; upsert by PokeAPI IDs; store raw jsonb snapshots; validate exactly
151; never overwrite curated coordinates; record runs in sync_runs).
Edge/hosting: Cloudflare Pages (production + PR preview deploys) + Pages Functions as a thin BFF
(/api/health, optional /api/pokemon, /api/map) + optional Cloudflare Cache/KV only after measuring need.
Data model summary: normalized Pokémon tables (pokemon, species, types, stats, abilities,
evolution links) + curated kanto_locations / kanto_map_points + pokemon_encounters with
confidence labels + sync_runs.
Environments: local, preview, production; OAuth redirect URLs per environment.
CI/CD: GitHub + GitHub Actions (typecheck, lint, unit/component tests, build, Playwright smoke)
on PRs; merge to main deploys production after CI passes.
Testing: Vitest + React Testing Library + Playwright + axe-core + Lighthouse CI.
Observability: Sentry + Cloudflare Analytics + Supabase logs; alert on failed sync.
Security architecture: state how the plan satisfies each constitution MUST (RLS on user tables;
service-role key server-only / never in client bundle; CSP + headers at Cloudflare; Zod
validation + bounded pagination; no dangerouslySetInnerHTML; admin-only, rate-limited sync).
────────────────────────────────────────────────────────
OUTPUT FORMAT
Return the three deliverables under clear headings: (1) constitution.md as a full document,
(2) the /speckit.specify prompt as one copyable block, (3) the /speckit.plan prompt as one
copyable block. Note any assumptions before writing.
```


## Scaffolding the GitHub Repo

I created a new repo on GitHub, synced up locally, and began to setup the project, first creating the AGENTS.md and CLAUDE.md files.

I setup **[GitHub Spec Kit](https://github.com/github/spec-kit)** in the repo and created the project's **`constitution.md`**, **`spec.md`**, and **`plan.md`** using the provided prompts from Claude Cowork.

I also had to get GitHub, Cloudflare, and Supabase setup together.