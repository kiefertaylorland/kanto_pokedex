import { supabase } from '@/lib/supabase';

export interface PokemonOption {
  dex: number;
  label: string;
}

/** All 151 Pokémon as picker options ("№NNN · Name"), ordered by dex. */
export async function fetchPokemonOptions(): Promise<PokemonOption[]> {
  const { data, error } = await supabase
    .from('pokemon_browser')
    .select('national_dex_number, display_name')
    .order('national_dex_number', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as { national_dex_number: number; display_name: string }[]).map((r) => ({
    dex: r.national_dex_number,
    label: `№${String(r.national_dex_number).padStart(3, '0')} · ${r.display_name}`,
  }));
}
