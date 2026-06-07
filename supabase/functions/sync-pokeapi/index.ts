// PokéAPI sync — Supabase Edge Function (Deno).
//
// SEC-014: server-only, rate-limited, validates EXACTLY 151 records with the
// required fields before marking a run `success`, records every run in
// `sync_runs`, and writes ONLY provider-sourced fields — it never touches the
// curated kanto_locations / kanto_map_points tables.
// SEC-005: uses the service-role key, which exists only in the function's env.
// SEC-007/008: validates upstream payloads with Zod; all DB writes go through
// the Supabase query builder (no string SQL).
//
// Fetches run with bounded concurrency and writes are batched, so the whole
// 151-record sync completes in a handful of DB round-trips.
//
// Trigger (server context only):
//   POST /functions/v1/sync-pokeapi  with  Authorization: Bearer <SYNC_SECRET>

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const POKEAPI = 'https://pokeapi.co/api/v2';
const MIN_DEX = 1;
const MAX_DEX = 151;
const RATE_LIMIT_SECONDS = 60;
const FETCH_CONCURRENCY = 12;

const STAT_SORT: Record<string, number> = {
  hp: 1, attack: 2, defense: 3, 'special-attack': 4, 'special-defense': 5, speed: 6,
};

const pokemonSchema = z.object({
  id: z.number().int().min(MIN_DEX).max(MAX_DEX),
  name: z.string().min(1),
  height: z.number().int().nullable(),
  weight: z.number().int().nullable(),
  base_experience: z.number().int().nullable(),
  sprites: z.object({
    front_default: z.string().url().nullable(),
    other: z.object({ 'official-artwork': z.object({ front_default: z.string().url().nullable() }).partial() }).partial().optional(),
  }).passthrough(),
  types: z.array(z.object({ slot: z.number().int(), type: z.object({ name: z.string(), url: z.string().url() }) })).min(1),
  stats: z.array(z.object({ base_stat: z.number().int(), effort: z.number().int(), stat: z.object({ name: z.string(), url: z.string().url() }) })).length(6),
  abilities: z.array(z.object({ is_hidden: z.boolean(), slot: z.number().int(), ability: z.object({ name: z.string(), url: z.string().url() }) })).min(1),
  species: z.object({ name: z.string(), url: z.string().url() }),
});

const speciesSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  generation: z.object({ name: z.string() }).optional(),
  habitat: z.object({ name: z.string() }).nullable().optional(),
  color: z.object({ name: z.string() }).optional(),
  shape: z.object({ name: z.string() }).nullable().optional(),
  flavor_text_entries: z.array(z.object({
    flavor_text: z.string(),
    language: z.object({ name: z.string() }),
    version: z.object({ name: z.string() }),
  })).default([]),
  evolution_chain: z.object({ url: z.string().url() }).nullable().optional(),
}).passthrough();

function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number.parseInt(m[1], 10) : NaN;
}
function titleCase(slug: string): string {
  return slug.split(/[-\s]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function pickFlavorText(entries: z.infer<typeof speciesSchema>['flavor_text_entries']): string | null {
  const en = entries.filter((e) => e.language.name === 'en');
  const rb = en.find((e) => e.version.name === 'red' || e.version.name === 'blue');
  const chosen = rb ?? en[0];
  return chosen ? chosen.flavor_text.replace(/\s+/g, ' ').trim() : null;
}
async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`upstream ${res.status} for ${url}`);
  return res.json();
}

/** Run `fn` over `items` with bounded concurrency, preserving input order. */
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

Deno.serve(async (req: Request) => {
  // --- AuthZ: server-only trigger (SEC-014) ---
  const expected = Deno.env.get('SYNC_SECRET') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!expected || token !== expected) return json({ error: 'unauthorized' }, 401);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // --- Rate limit at the trigger (SEC-014) ---
  const since = new Date(Date.now() - RATE_LIMIT_SECONDS * 1000).toISOString();
  const { data: recent } = await db.from('sync_runs').select('id').gte('started_at', since).limit(1);
  if (recent && recent.length > 0) return json({ error: 'rate_limited' }, 429);

  const { data: run, error: runErr } = await db
    .from('sync_runs').insert({ source: 'pokeapi', status: 'running' }).select('id').single();
  if (runErr || !run) return json({ error: 'could_not_start_run' }, 500);
  const runId = run.id as string;

  const processed: number[] = [];
  try {
    const now = () => new Date().toISOString();
    const dexList = Array.from({ length: MAX_DEX - MIN_DEX + 1 }, (_, i) => i + MIN_DEX);

    // Accumulators (deduped by id where applicable).
    const typesById = new Map<number, Record<string, unknown>>();
    const statsById = new Map<number, Record<string, unknown>>();
    const abilitiesById = new Map<number, Record<string, unknown>>();
    const speciesById = new Map<number, Record<string, unknown>>();
    const pokemonRows: Record<string, unknown>[] = [];
    const pokemonTypes: Record<string, unknown>[] = [];
    const pokemonStats: Record<string, unknown>[] = [];
    const pokemonAbilities: Record<string, unknown>[] = [];
    const chainIds = new Set<number>();

    // 1) Fetch + normalize all 151 (bounded concurrency).
    await mapPool(dexList, FETCH_CONCURRENCY, async (dex) => {
      const rawPokemon = await fetchJson(`${POKEAPI}/pokemon/${dex}`);
      const p = pokemonSchema.parse(rawPokemon);
      const rawSpecies = await fetchJson(p.species.url);
      const sp = speciesSchema.parse(rawSpecies);
      const evolutionChainId = sp.evolution_chain ? idFromUrl(sp.evolution_chain.url) : null;
      if (evolutionChainId) chainIds.add(evolutionChainId);

      speciesById.set(sp.id, {
        id: sp.id, name: sp.name, generation: sp.generation?.name ?? null,
        habitat: sp.habitat?.name ?? null, color: sp.color?.name ?? null, shape: sp.shape?.name ?? null,
        flavor_text: pickFlavorText(sp.flavor_text_entries), evolution_chain_id: evolutionChainId,
        raw_payload: rawSpecies, last_synced_at: now(),
      });

      pokemonRows.push({
        id: p.id, national_dex_number: p.id, name: p.name, display_name: titleCase(p.name),
        height: p.height, weight: p.weight, base_experience: p.base_experience,
        sprite_url: p.sprites.front_default,
        official_artwork_url: p.sprites.other?.['official-artwork']?.front_default ?? null,
        species_id: sp.id, base_stat_total: p.stats.reduce((s, x) => s + x.base_stat, 0),
        raw_payload: rawPokemon, last_synced_at: now(),
      });

      for (const t of p.types) {
        const id = idFromUrl(t.type.url);
        typesById.set(id, { id, name: t.type.name, display_name: titleCase(t.type.name) });
        pokemonTypes.push({ pokemon_id: p.id, type_id: id, slot: t.slot });
      }
      for (const s of p.stats) {
        const id = idFromUrl(s.stat.url);
        statsById.set(id, { id, name: s.stat.name, display_name: titleCase(s.stat.name), sort_order: STAT_SORT[s.stat.name] ?? id });
        pokemonStats.push({ pokemon_id: p.id, stat_id: id, base_stat: s.base_stat, effort: s.effort });
      }
      for (const a of p.abilities) {
        const id = idFromUrl(a.ability.url);
        abilitiesById.set(id, { id, name: a.ability.name, display_name: titleCase(a.ability.name) });
        pokemonAbilities.push({ pokemon_id: p.id, ability_id: id, slot: a.slot, is_hidden: a.is_hidden });
      }
      processed.push(p.id);
    });

    // 2) Fetch evolution chains (parallel) and build chain + link rows.
    const chainList = [...chainIds];
    const chainRows: Record<string, unknown>[] = [];
    const linkRows: Record<string, unknown>[] = [];
    await mapPool(chainList, FETCH_CONCURRENCY, async (chainId) => {
      const raw = await fetchJson(`${POKEAPI}/evolution-chain/${chainId}`);
      chainRows.push({ id: chainId, raw_payload: raw, last_synced_at: now() });
      type Node = {
        species: { name: string; url: string };
        evolves_to: Node[];
        evolution_details: Array<{ trigger?: { name: string }; min_level?: number | null; item?: { name: string } | null }>;
      };
      const walk = (node: Node, parent: number | null) => {
        const speciesId = idFromUrl(node.species.url);
        const d = node.evolution_details[0];
        linkRows.push({
          chain_id: chainId, from_species_id: parent, to_species_id: speciesId,
          trigger: d?.trigger?.name ?? null, min_level: d?.min_level ?? null,
          item_name: d?.item?.name ?? null, conditions: d ?? null,
        });
        for (const child of node.evolves_to) walk(child, speciesId);
      };
      walk((raw as { chain: Node }).chain, null);
    });

    // 3) Batch upserts — reference first (FK targets), then join tables.
    await upsert(db, 'types', [...typesById.values()]);
    await upsert(db, 'stats', [...statsById.values()]);
    await upsert(db, 'abilities', [...abilitiesById.values()]);
    await upsert(db, 'evolution_chains', chainRows);
    await upsert(db, 'pokemon_species', [...speciesById.values()]);
    await upsert(db, 'pokemon', pokemonRows);
    await upsert(db, 'pokemon_types', pokemonTypes);
    await upsert(db, 'pokemon_stats', pokemonStats);
    await upsert(db, 'pokemon_abilities', pokemonAbilities);

    // Replace evolution links for the synced chains, then insert fresh.
    if (chainList.length > 0) {
      const del = await db.from('evolution_links').delete().in('chain_id', chainList);
      if (del.error) throw del.error;
      await insert(db, 'evolution_links', linkRows);
    }

    // 4) Success gate: exactly 151 contiguous records (SEC-014).
    const unique = new Set(processed);
    if (unique.size !== 151) throw new Error(`expected 151 records, processed ${unique.size}`);
    for (let i = MIN_DEX; i <= MAX_DEX; i++) if (!unique.has(i)) throw new Error(`missing dex number ${i}`);

    await db.from('sync_runs').update({ status: 'success', finished_at: now(), records_processed: unique.size }).eq('id', runId);
    return json({ status: 'success', records_processed: unique.size }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'sync failed';
    await db.from('sync_runs').update({
      status: 'failed', finished_at: new Date().toISOString(),
      records_processed: processed.length, error_message: message.slice(0, 500),
    }).eq('id', runId);
    console.error('sync-pokeapi failed:', message);
    return json({ status: 'failed' }, 500);
  }
});

async function upsert(db: SupabaseClient, table: string, rows: Record<string, unknown>[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await db.from(table).upsert(rows);
  if (error) throw new Error(`${table} upsert: ${error.message}`);
}
async function insert(db: SupabaseClient, table: string, rows: Record<string, unknown>[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await db.from(table).insert(rows);
  if (error) throw new Error(`${table} insert: ${error.message}`);
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
