import { z } from 'zod';
import { TYPE_NAMES } from '../constants/types';
import { MIN_DEX, MAX_DEX } from '../constants/index';

/**
 * Validation contract for PokéAPI payloads consumed by the sync edge function
 * (SEC-007). Only the subset we persist is validated strictly; unknown fields
 * are tolerated via `.passthrough()` where the upstream shape is large.
 */
export const pokeApiPokemonSchema = z.object({
  id: z.number().int().min(MIN_DEX).max(MAX_DEX),
  name: z.string().min(1),
  height: z.number().int().nullable().default(null),
  weight: z.number().int().nullable().default(null),
  base_experience: z.number().int().nullable().default(null),
  sprites: z
    .object({
      front_default: z.string().url().nullable(),
      other: z
        .object({
          'official-artwork': z
            .object({ front_default: z.string().url().nullable() })
            .partial()
            .optional(),
        })
        .partial()
        .optional(),
    })
    .passthrough(),
  types: z
    .array(z.object({ slot: z.number().int(), type: z.object({ name: z.enum(TYPE_NAMES) }) }))
    .min(1),
  stats: z
    .array(z.object({ base_stat: z.number().int(), effort: z.number().int(), stat: z.object({ name: z.string() }) }))
    .length(6),
  abilities: z
    .array(
      z.object({
        is_hidden: z.boolean(),
        slot: z.number().int(),
        ability: z.object({ name: z.string() }),
      }),
    )
    .min(1),
  species: z.object({ name: z.string(), url: z.string().url() }),
});

export type PokeApiPokemon = z.infer<typeof pokeApiPokemonSchema>;

export const pokeApiSpeciesSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    generation: z.object({ name: z.string() }).optional(),
    flavor_text_entries: z
      .array(
        z.object({
          flavor_text: z.string(),
          language: z.object({ name: z.string() }),
          version: z.object({ name: z.string() }),
        }),
      )
      .default([]),
    evolution_chain: z.object({ url: z.string().url() }).nullable().optional(),
  })
  .passthrough();

export type PokeApiSpecies = z.infer<typeof pokeApiSpeciesSchema>;

/** Result the sync function records in `sync_runs`. */
export const SYNC_STATUSES = ['running', 'success', 'failed'] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const syncRunResultSchema = z.object({
  status: z.enum(SYNC_STATUSES),
  records_processed: z.number().int().nonnegative(),
  error_message: z.string().nullable(),
});
export type SyncRunResult = z.infer<typeof syncRunResultSchema>;

/**
 * The success gate (SEC-014): a run is only `success` when exactly 151 records
 * with all required fields were processed. Returns the validated count or a
 * reason string for the failure path.
 */
export function evaluateSyncResult(processedIds: number[]): { ok: true; count: number } | { ok: false; reason: string } {
  const unique = new Set(processedIds);
  if (unique.size !== 151) {
    return { ok: false, reason: `expected exactly 151 records, processed ${unique.size}` };
  }
  for (let i = MIN_DEX; i <= MAX_DEX; i++) {
    if (!unique.has(i)) return { ok: false, reason: `missing dex number ${i}` };
  }
  return { ok: true, count: unique.size };
}
