# Contract: PokéAPI Sync Payload & Run Result

Implemented in `packages/shared/src/schemas/sync.ts` and enforced by `supabase/functions/sync-pokeapi`. Satisfies SEC-007 (validate external input) and SEC-014 (sync integrity).

## Per-Pokémon validated payload (subset of PokéAPI we persist)

```ts
export const syncPokemonSchema = z.object({
  id: z.number().int().min(1).max(151),
  name: z.string().min(1),
  height: z.number().int().nullable(),
  weight: z.number().int().nullable(),
  base_experience: z.number().int().nullable(),
  sprites: z.object({ /* front_default + official-artwork */ }).passthrough(),
  types: z.array(z.object({ slot: z.number().int(), type: z.object({ name: z.enum(TYPE_NAMES) }) })).min(1),
  stats: z.array(z.object({ base_stat: z.number().int(), stat: z.object({ name: z.string() }) })).length(6),
  abilities: z.array(z.object({ is_hidden: z.boolean(), slot: z.number().int(), ability: z.object({ name: z.string() }) })).min(1),
  species: z.object({ url: z.string().url() }),
});
```

Species (flavor text, prefer Red/Blue English), evolution-chain, and encounter payloads have parallel schemas.

## Required-field gate (before marking a run `success`)

A run is `success` **only if** all of:
1. Exactly **151** Pokémon parsed (IDs 1–151, no gaps/dupes).
2. Each has: name, dex number, ≥1 type, six stats, ≥1 image URL, a species link.
3. Each persisted encounter row has a non-null `confidence`.

Any failure → run marked `failed` with a generic `error_message`, and an alert fires. Curated `kanto_locations`/`kanto_map_points` are **excluded from all write paths** (SEC-014).

## `sync_runs` row contract

```ts
{ id, source: 'pokeapi', started_at, finished_at, status: 'running'|'success'|'failed',
  records_processed, error_message, metadata }
```

## Invocation contract (SEC-014)

- Callable only with the service-role key (server context); not exposed to anon/authenticated client roles.
- Rate-limited at the trigger (scheduled weekly via pg_cron + manual admin trigger).
- Upserts by stable PokeAPI `id`; stores `raw_payload` jsonb snapshot per record for traceability.
