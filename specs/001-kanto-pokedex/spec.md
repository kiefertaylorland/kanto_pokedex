# Feature Specification: Kanto Pokédex Web Application

**Feature Branch**: `001-kanto-pokedex`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "Build a web application called the Kanto Pokédex: a polished, fast, nostalgic, and accessible way to explore the original 151 Generation I Pokémon."

## Clarifications

### Session 2026-06-06

- Q: Should the Kanto map include a Pokémon/location filter control (PRD FR-MAP-004)? → A: Defer to Phase 2 — map MVP is marker-click → encounter panel interaction only; no search/filter layer on the map screen.
- Q: Should the Pokémon detail page show the classic Pokédex entry flavor text (from the Red/Blue game version)? → A: Yes — display the English Red/Blue flavor text as a named section on the detail page.
- Q: Which fallback authentication method should the auth screen offer beyond Google and GitHub? → A: Email magic link — passwordless login via a link sent to the user's email; no third OAuth app required.
- Q: Should the encounter panel and detail page location summary display the encounter method (walk, surf, fishing, etc.) alongside the provenance label? → A: Yes — show the method when available (e.g., "Walking," "Surfing," "Old Rod") in both the map encounter panel and the detail page location summary.
- Docs-resolved: An authenticated user who visits the landing page MUST be redirected to the Pokédex browser (not remain on the landing page). Source: PRD FR-AUTH-006 and acceptance criteria.
- Q: Should search/filter/sort/page state be preserved in URL query parameters or in-memory? → A: URL query parameters — shareable, bookmarkable, back-button support.
- Q: Should encounter_method be an attribute on the Encounter entity? → A: Yes — stored as optional field on Encounter, populated during PokéAPI sync.
- Q: What is the status of the Kanto map art asset? → A: Built as SVG in code during development — no external dependency.
- Q: What is the fixed page size for the Pokédex browser? → A: 20 Pokémon per page.
- Q: Should the Kanto map support panning and pinch-to-zoom on mobile? → A: No — fixed static viewport that scales to fit the screen; all markers accessible without pan/zoom.
- Q: How should a numeric search query match Pokédex numbers? → A: Exact number match — a purely numeric query matches only that exact Pokédex number (e.g., "25" → only #025); name queries remain case-insensitive substring matches.
- Q: Can users select multiple types in the filter, and how do selections combine? → A: Multi-select with OR/union — results include any Pokémon matching at least one selected type.
- Q: What is the MVP sync-trigger surface and role model? → A: Scheduled and/or server-side (service-role) invocation; no in-app admin role or admin UI — all authenticated users have identical access.
- Q: Does the public landing page preview render live Pokémon data? → A: No — the preview is static/illustrative only; no live protected data is fetched on the public landing page.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — New Visitor to Authenticated User (Priority: P1)

A first-time visitor arrives at the landing page, understands the product, and creates an account or signs in, gaining access to the protected Pokédex experience.

**Why this priority**: Authentication is the gateway to all protected features. Without this, no other story can proceed, and the security constitution's auth-gate requirement cannot be validated.

**Independent Test**: Can be fully tested by visiting the root URL, reading the landing page, clicking the primary CTA, completing sign-up, verifying redirect to the Pokédex browser, signing out, and confirming that protected routes redirect back to auth.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on the landing page, **When** they click the primary CTA, **Then** they are taken to the authentication screen.
2. **Given** a new user on the auth screen, **When** they complete sign-up, **Then** they are redirected into the Pokédex browser with a valid session.
3. **Given** a signed-in user, **When** they sign out, **Then** their session ends and any attempt to visit a protected route redirects to the authentication screen.
4. **Given** an unauthenticated user who navigates directly to any protected URL, **When** the page loads, **Then** they are immediately redirected to the authentication screen with no protected data visible.
5. **Given** a user on the auth screen who provides invalid credentials, **When** they submit, **Then** a clear, user-friendly error message is displayed and no access is granted.
6. **Given** an already authenticated user who navigates to the landing page, **When** the page loads, **Then** they are automatically redirected to the Pokédex browser.

---

### User Story 2 — Browse and Find Pokémon (Priority: P2)

A signed-in user browses all 151 original Pokémon, searches by name or number, filters by type, sorts the list, and paginates through results — with all applied state preserved across pages.

**Why this priority**: The Pokédex browser is the core product experience and the primary destination after authentication. All 151 Pokémon must be discoverable here.

**Independent Test**: Can be fully tested by signing in, verifying all 151 Pokémon appear across paginated results, searching for "bulb", filtering to Water type, sorting by base-stat total, navigating to page 2, and confirming all state is preserved.

**Acceptance Scenarios**:

1. **Given** a signed-in user on the Pokédex browser, **When** the page loads, **Then** Pokémon cards are shown (paginated), each displaying Pokédex number, name, sprite/artwork, and type(s).
2. **Given** a signed-in user, **When** they type "char" in the search field, **Then** only Pokémon whose names contain "char" (case-insensitive) or, for a purely numeric query, whose Pokédex number exactly matches are shown.
3. **Given** a signed-in user, **When** they select "Fire" in the type filter, **Then** only Fire-type Pokémon are shown.
4. **Given** a signed-in user, **When** they sort by "Base Stat Total", **Then** Pokémon are ordered deterministically by the sum of their six base stats; ties are resolved by Pokédex number.
5. **Given** a signed-in user who has applied a search term, type filter, and sort, **When** they navigate to page 2, **Then** all applied search, filter, and sort selections remain active.
6. **Given** a signed-in user whose search or filter returns no matches, **When** the results update, **Then** a clear empty-state message is shown with guidance to clear filters.
7. **Given** a signed-in user, **When** data is loading, **Then** a loading state is shown; if loading fails, an error state with recovery options is shown.

---

### User Story 3 — View Pokémon Details (Priority: P3)

A signed-in user opens a Pokémon's detail page and sees its number, name, artwork, types, six base stats, abilities (with hidden ability marked), height, weight, evolution chain, and location/encounter summary.

**Why this priority**: Detail pages are the core informational deliverable — the "answer" to the browsing experience. They must be complete for all 151 Pokémon.

**Independent Test**: Can be fully tested by opening a detail page for Eevee (multiple evolutions), Snorlax (limited encounters), and Mew (no encounter data), and verifying that all data sections render correctly with appropriate fallbacks.

**Acceptance Scenarios**:

1. **Given** a signed-in user who clicks a Pokémon card, **When** the detail page loads, **Then** the Pokédex number, name, artwork, and type(s) are shown.
2. **Given** a signed-in user on any detail page, **When** the stats section loads, **Then** all six base stats (HP, Attack, Defense, Special Attack, Special Defense, Speed) are displayed with numeric values.
3. **Given** a signed-in user on a detail page, **When** the abilities section loads, **Then** all abilities are listed; any hidden ability is visually distinguished and labeled "Hidden Ability."
4. **Given** a signed-in user on a detail page, **When** the physical attributes section loads, **Then** height and weight are displayed.
5. **Given** a signed-in user on a detail page for a Pokémon with an evolution chain, **When** the evolution section loads, **Then** all Pokémon in the chain are shown with links to their respective detail pages.
6. **Given** a signed-in user on a detail page for a Pokémon with location data, **When** the location section loads, **Then** a summary of encounter locations is shown, each with a provenance label ("pokeapi", "curated", "inferred", or "unknown").
7. **Given** a signed-in user on a detail page for a Pokémon with no location data, **When** the location section loads, **Then** a graceful fallback message is shown (not an error).
8. **Given** a signed-in user on any detail page, **When** the Pokédex entry section loads, **Then** the classic Red/Blue flavor text is shown (e.g., "A strange seed was planted on its back at birth…"); if no flavor text is available, a graceful fallback is shown.
9. **Given** a signed-in user viewing a location entry, **When** they click the location link, **Then** they are taken to the Kanto map with that location in context.
10. **Given** a signed-in user, **When** any section of the detail page is loading, **Then** a loading state is shown; if a section fails to load, a section-level error state with retry is shown.

---

### User Story 4 — Explore the Kanto Map (Priority: P4)

A signed-in user opens the Kanto-inspired map, clicks or taps a location marker, views the encounter list with provenance labels, and follows a link to a Pokémon detail page — on both desktop and mobile.

**Why this priority**: The map is the product's key differentiator, connecting Pokémon to Kanto locations with transparent provenance. It depends on Stories 2 and 3 being functional.

**Independent Test**: Can be fully tested by navigating to the map on a desktop browser and on a mobile viewport, tapping a marker, verifying the encounter panel opens with provenance labels, and following a Pokémon link.

**Acceptance Scenarios**:

1. **Given** a signed-in user who navigates to the Kanto map, **When** the map loads, **Then** an original retro-inspired Kanto map is shown with clickable/tappable markers for each curated location.
2. **Given** a signed-in user on the map, **When** they click or tap a location marker, **Then** a panel opens listing the Pokémon encounters for that location, each with a provenance label.
3. **Given** a signed-in user viewing an encounter panel, **When** they click or tap a Pokémon's name/link, **Then** they are navigated to that Pokémon's detail page.
4. **Given** a signed-in user on a mobile-sized viewport, **When** they tap a location marker, **Then** the encounter panel opens fully and is usable via touch, with no content clipped or inaccessible; the map renders as a fixed, scale-to-fit viewport with all markers visible without panning or zooming.
5. **Given** a signed-in user who arrived at the map via a location link from a detail page, **When** the map loads, **Then** the referenced location's panel is open or the location is visually highlighted in context.
6. **Given** a signed-in user, **When** the map fails to load, **Then** an error state with a retry option is shown.

---

### Edge Cases

- What happens when PokéAPI is unavailable? The app serves its own synced data store; users see no degradation if a sync is in-flight or fails — the existing dataset remains intact.
- What happens when a Pokémon has no sprite available? A styled placeholder is shown in place of the missing image.
- What happens when the user searches for a Pokémon number outside 1–151? The empty state is shown with no adverse effects.
- What happens when special characters are typed in search? Input is treated as literal text; no injection or unexpected behavior occurs.
- What happens when a detail page URL is requested for a number outside 1–151? A not-found state is shown.
- What happens when a user's session expires mid-browsing? The system detects the expired session on the next data request and redirects the user to the authentication screen with a clear message.
- What happens when a location has no encounters in the dataset? The marker is still shown; the encounter panel displays a graceful empty state.

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Landing**

- **FR-001**: The system MUST present a public landing page accessible without authentication, communicating the product name, value proposition, and a preview of core features. The feature preview MUST be static/illustrative and MUST NOT fetch live protected Pokémon data; no protected dataset is exposed on the public landing page.
- **FR-002**: The landing page MUST include a primary call-to-action ("Open Pokédex" / "Get Started") that takes unauthenticated users to the authentication screen.
- **FR-003**: The system MUST allow users to sign up and sign in via Google SSO, GitHub SSO, and email magic link (passwordless email login).
- **FR-004**: The system MUST allow signed-in users to sign out, fully terminating their session and access to protected areas.
- **FR-005**: The system MUST redirect any unauthenticated user who attempts to reach a protected route to the authentication screen, with no protected data exposed.
- **FR-005b**: An authenticated user who visits the landing page MUST be automatically redirected to the Pokédex browser.
- **FR-006**: The authentication screen MUST display clear, user-friendly error messages when sign-in fails.
- **FR-007**: After successful authentication, the system MUST redirect the user to the Pokédex browser.

**Pokédex Browser**

- **FR-008**: The Pokédex browser MUST display all 151 Generation I Pokémon.
- **FR-009**: Each Pokémon card MUST display: Pokédex number, name, sprite/artwork, and type(s).
- **FR-010**: Users MUST be able to search by Pokémon name or number. Name matching MUST be case-insensitive substring (partial) matching. A purely numeric query MUST match only the exact Pokédex number (e.g., "25" matches only #025).
- **FR-011**: Users MUST be able to filter displayed Pokémon by type via a multi-select control; selected types MUST combine by union (OR) — results include any Pokémon matching at least one selected type, so multi-type Pokémon appear when any of their types is selected.
- **FR-012**: Users MUST be able to sort by Pokédex number, name (alphabetical), or base-stat total (sum of all six stats); sort order MUST be deterministic (ties broken by Pokédex number).
- **FR-013**: Results MUST be paginated with a fixed page size of 20 Pokémon per page.
- **FR-014**: Search term, active type filter, sort selection, and current page MUST all be preserved as the user interacts via URL query parameters, enabling shareable, bookmarkable URLs and correct browser back/forward navigation.
- **FR-015**: The browser MUST show a loading state while data is fetching, an empty state when no results match, and an error state when data cannot be retrieved.

**Pokémon Detail Page**

- **FR-016**: Each of the 151 Pokémon MUST have a detail page accessible by a stable, direct URL.
- **FR-017**: The detail page MUST display: Pokédex number, name, artwork, and type(s).
- **FR-018**: The detail page MUST display all six base stats: HP, Attack, Defense, Special Attack, Special Defense, and Speed.
- **FR-019**: The detail page MUST display all abilities; hidden abilities MUST be clearly labeled "Hidden Ability."
- **FR-020**: The detail page MUST display the Pokémon's height and weight.
- **FR-021**: The detail page MUST display the full evolution chain; each Pokémon in the chain MUST link to its own detail page.
- **FR-022**: The detail page MUST display the Pokédex entry flavor text (preferring the English Red/Blue game version text); when no flavor text is available, a graceful fallback MUST be shown.
- **FR-023**: The detail page MUST display a location/encounter summary; when no location data exists, a graceful fallback message MUST be shown (not an error).
- **FR-024**: Each location entry MUST display a provenance label from the fixed vocabulary ("pokeapi", "curated", "inferred", or "unknown") and the encounter method (e.g., "Walking," "Surfing," "Old Rod") when available.
- **FR-025**: Each location entry MUST include a link that opens the Kanto map with that location in context.
- **FR-026**: The detail page MUST show loading and error states for each major data section independently.

**Kanto Map**

- **FR-027**: The Kanto map MUST display an original, retro-inspired visual Kanto map with clickable/tappable markers for each curated location.
- **FR-028**: Clicking or tapping a marker MUST open an encounter panel for that location.
- **FR-029**: Each encounter entry in the panel MUST show the Pokémon name, a provenance label from the fixed vocabulary, and the encounter method (e.g., "Walking," "Surfing," "Old Rod") when available.
- **FR-030**: Each encounter entry MUST link to that Pokémon's detail page.
- **FR-031**: The map MUST render as a fixed, scale-to-fit viewport on all screen sizes with all curated location markers visible; touch-tap on any marker MUST open the encounter panel. No pan or pinch-to-zoom is required for the MVP.
- **FR-032**: When opened via a location link from a detail page, the map MUST open with the referenced location in context.
- **FR-033**: The map MUST show loading and error states.
- **NOTE**: Filtering the map by Pokémon name or location name is deferred to Phase 2; the MVP map does not include a search or filter control.

**Cross-Cutting Quality**

- **FR-034**: Every data-driven view MUST have defined loading, empty (where applicable), and error states.
- **FR-035**: The interface MUST be responsive across desktop, tablet, and mobile viewports.
- **FR-036**: All primary interactions (browsing, search, filter, sort, map navigation, page navigation) MUST be keyboard-accessible.
- **FR-037**: Type badges and map markers MUST meet WCAG 2.1 AA color-contrast standards.
- **FR-038**: One user's data MUST never be readable or modifiable by another user.

### Key Entities

- **Pokémon**: Canonical record for one of the 151 Generation I Pokémon. Attributes: Pokédex number (1–151), name, types (1–2), six base stats, abilities (regular + optional hidden), height, weight, sprite URL, artwork URL, evolution chain reference.
- **Evolution Chain**: An ordered sequence linking Pokémon that evolve from one another. Contains references and display names for each stage.
- **Kanto Location**: A named Kanto area with curated map coordinates. Attributes: name, map coordinates (for marker placement), optional description.
- **Encounter**: A relationship between a Pokémon and a Kanto Location. Attributes: Pokémon reference, location reference, provenance label ("pokeapi" | "curated" | "inferred" | "unknown"), encounter_method (optional string, e.g., "Walking", "Surfing", "Old Rod", "Good Rod", "Super Rod") — sourced from PokéAPI encounter data during sync.
- **User**: A registered account. Identity is fully managed by the authentication provider. The application stores only a minimal, non-sensitive profile record keyed to the provider's user ID. The profile carries no role/privilege attribute in the MVP — all authenticated users have identical access (no admin role).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new visitor can understand the product purpose and initiate the sign-up flow entirely from the landing page, without external guidance.
- **SC-002**: A user can complete the sign-up or sign-in flow and reach the Pokédex browser in under 2 minutes.
- **SC-003**: All 151 Generation I Pokémon are visible to a signed-in user through the browser's default paginated view; zero Pokémon are missing.
- **SC-004**: A user searching by partial name or number sees matching results appear within 1 second of input submission.
- **SC-005**: Any combination of search, type filter, and sort produces correct, deterministic results that remain consistent when the user paginates.
- **SC-006**: A user can open a detail page for every one of the 151 Pokémon and see all required data sections rendered or their appropriate fallback: number, name, artwork, types, six stats, abilities (hidden marked), height/weight, Pokédex entry flavor text, evolution chain, and location summary.
- **SC-007**: A user can open the Kanto map, tap or click any curated location marker, and see an encounter panel with at least one entry and a provenance label — verified on both a desktop browser and a mobile-sized viewport.
- **SC-008**: Every unauthenticated attempt to access a protected route results in a redirect to the authentication screen with no protected data visible or exposed.
- **SC-009**: Every major view shows a loading state while fetching, an error state on failure, and (where applicable) an empty state when no data matches criteria.
- **SC-010**: Core flows (landing → auth, Pokédex browse, detail page, map marker interaction) pass keyboard-accessibility validation and meet WCAG 2.1 AA color-contrast standards for type badges and map markers.
- **SC-011**: No user can access or modify data belonging to a different user, verified by cross-user access tests.

---

## Assumptions

- **Data source**: PokéAPI (https://pokeapi.co) is the upstream source for Pokémon data (stats, abilities, types, evolution chains, and raw encounter data).
- **Data sync**: Pokémon data is synced from PokéAPI into the application's own data store at setup and on a schedule; the app does not call PokéAPI directly at runtime for browsing.
- **Sync trigger & roles**: The sync runs only on a schedule and/or via server-side (service-role) invocation; it is never triggered from the client. There is no in-app admin role or admin UI in the MVP — all authenticated users have identical access.
- **Map art**: The Kanto map visual is an original, purpose-built retro-inspired SVG built as part of the application codebase during development — not derived from official Pokémon game assets. No external asset needs to be created or commissioned before the map feature can begin.
- **Location coordinates**: The map coordinate layer (marker positions) is a product-owned, curated dataset separate from PokéAPI encounter data.
- **Authentication provider**: Users authenticate via Google SSO, GitHub SSO, or email magic link through a managed identity provider. The application stores no passwords or credentials.
- **Generations scope**: Only Generation I (Pokédex numbers 1–151) is in scope.
- **Sprites and artwork**: PokéAPI official artwork and sprites are used for all 151 Pokémon.
- **Encounter provenance**: For the MVP, encounter provenance labels are manually curated per encounter record; this is a curatorial responsibility, not an automated derivation.
- **Move data**: Move details are out of scope; moves are not shown on the detail page.
- **Favorites**: User favorites are planned for Phase 2 and are excluded from this specification.
- **Performance**: Pages render visually within 3 seconds on a typical broadband connection; search and filter responses are near-instantaneous (< 1 second) against the locally synced dataset.
- **Accessibility standard**: WCAG 2.1 Level AA for contrast; keyboard navigation for all primary interactions.
