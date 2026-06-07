# Phase 1 Data Model: Kanto Pokédex

Full attribute-level tables live in [`docs/07-data-model.md`](../../docs/07-data-model.md) §4 and are the source of truth for column types — they are **not** re-typed here. This artifact captures the entity set, ownership/RLS classification, relationships, indexes, and validation rules that the migrations in `supabase/migrations/` must implement.

## Entity classification

| Class | Tables | Access | Written by |
|---|---|---|---|
| **Reference (provider)** | `pokemon`, `pokemon_species`, `types`, `pokemon_types`, `stats`, `pokemon_stats`, `abilities`, `pokemon_abilities`, `evolution_chains`, `evolution_links`, `locations`, `location_areas`, `pokemon_encounters` | Authenticated `SELECT` only | `sync-pokeapi` (service role) |
| **Curated (product)** | `kanto_locations`, `kanto_map_points` | Authenticated `SELECT` only | Seed/migration only — **never** the sync |
| **System** | `sync_runs` | No client access | `sync-pokeapi` (service role) |
| **User-owned** | `profiles`, `user_preferences` (`user_favorites` = product Phase 2) | RLS: owner only | The owning user |

## Relationships

```text
auth.users 1──1 profiles 1──1 user_preferences
pokemon 1──1 pokemon_species ──* evolution? (species *──1 evolution_chains 1──* evolution_links)
pokemon *──* types        (via pokemon_types, slot-ordered)
pokemon *──* abilities     (via pokemon_abilities, is_hidden flag)
pokemon 1──* pokemon_stats (six rows; base_stat_total derived)
pokemon 1──* pokemon_encounters
locations 1──* location_areas 1──* pokemon_encounters
kanto_locations 1──* kanto_map_points
kanto_locations 1──* pokemon_encounters   (curated/inferred mapping)
```

## Key fields driving features

- `pokemon.national_dex_number` (1–151), `pokemon.name`/`display_name`, `pokemon.base_stat_total` — browser sort/search (FR-010..013).
- `pokemon_types.slot`, `types.name` — type filter (multi-select OR, FR-011).
- `pokemon_abilities.is_hidden` — hidden ability marker (FR-019).
- `pokemon_species.flavor_text` — Red/Blue preferred, English fallback (FR-023).
- `pokemon_encounters.confidence` ∈ {`pokeapi`,`curated`,`inferred`,`unknown`} + `method` — provenance labels & encounter method (FR-021/025/030/031).
- `kanto_map_points.x/y` — SVG marker placement (FR-028).
- `sync_runs.status` ∈ {`running`,`success`,`failed`} + `records_processed` — sync integrity (SEC-014).

## RLS model (SEC-004)

| Table | Policy |
|---|---|
| `profiles` | `SELECT/UPDATE` where `id = auth.uid()`; `INSERT` where `id = auth.uid()` (or via trigger) |
| `user_preferences` | `SELECT/INSERT/UPDATE` where `user_id = auth.uid()` |
| `user_favorites` (Phase 2) | `SELECT/INSERT/DELETE` where `user_id = auth.uid()` |
| Reference + curated tables | RLS enabled; policy = authenticated `SELECT` only; no client write policy |
| `sync_runs` | RLS enabled; no client policy (service role bypasses RLS) |

`profiles` is auto-created by an `AFTER INSERT ON auth.users` trigger writing only a non-credential row (id, optional display_name/avatar_url) — SEC-006.

## Indexes (from `docs/07` §6)

`pokemon(national_dex_number)`, `pokemon(name)`, `pokemon(base_stat_total)`, `pokemon_types(type_id)`, `pokemon_stats(pokemon_id)`, `pokemon_abilities(pokemon_id)`, `evolution_links(chain_id)`, `pokemon_encounters(pokemon_id)`, `pokemon_encounters(kanto_location_id)`, `kanto_map_points(kanto_location_id)`, `sync_runs(started_at)`.

## Validation rules (enforced by sync + DB constraints)

- Exactly 151 `pokemon` rows, IDs/dex numbers 1–151 (SEC-014, SC-003).
- Every Pokémon: ≥1 type, six stats, ≥1 image URL, a species row.
- `pokemon_encounters.confidence` NOT NULL.
- Evolution links acyclic (renderable without infinite recursion).
- Every visible `kanto_map_points` row has non-null `x`,`y`.
- `sort` param allow-listed; `page` clamped; numeric search ∈ 1–151 (SEC-007) — enforced in `packages/shared` Zod, see [contracts/](./contracts/).

## State transitions — `sync_runs`

```text
(insert) running ──validate 151 + required fields──> success
                  └──any fetch/validation failure────> failed (+ error_message, alert)
```
