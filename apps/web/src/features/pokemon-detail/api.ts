import { supabase } from '@/lib/supabase';
import {
  type PokemonDetail,
  type PokemonStat,
  type PokemonAbility,
  type EvolutionNode,
  type EncounterSummary,
  type TypeName,
} from '@kanto/shared';

interface DetailRow {
  id: number;
  national_dex_number: number;
  display_name: string;
  sprite_url: string | null;
  official_artwork_url: string | null;
  base_stat_total: number;
  height: number | null;
  weight: number | null;
  flavor_text: string | null;
  types: TypeName[] | null;
  stats: PokemonStat[] | null;
  abilities: PokemonAbility[] | null;
  evolution_chain: EvolutionNode[] | null;
  encounters: EncounterSummary[] | null;
}

/**
 * Reads the aggregated `pokemon_detail` view for one dex number (SEC-008).
 * Returns null when the row is absent so the route can render a not-found state
 * (the id was already range-validated via parseDexId).
 */
export async function fetchPokemonDetail(dexId: number): Promise<PokemonDetail | null> {
  const { data, error } = await supabase
    .from('pokemon_detail')
    .select('*')
    .eq('national_dex_number', dexId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as DetailRow;
  return {
    id: row.id,
    national_dex_number: row.national_dex_number,
    display_name: row.display_name,
    sprite_url: row.sprite_url,
    official_artwork_url: row.official_artwork_url,
    base_stat_total: row.base_stat_total,
    height: row.height,
    weight: row.weight,
    flavor_text: row.flavor_text,
    types: row.types ?? [],
    stats: row.stats ?? [],
    abilities: row.abilities ?? [],
    evolution_chain: row.evolution_chain ?? [],
    encounters: row.encounters ?? [],
  };
}
