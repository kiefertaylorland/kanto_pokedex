import { supabase } from '@/lib/supabase';
import { type PokemonCard, type TypeName } from '@kanto/shared';

interface FavoriteRow {
  id: number;
  national_dex_number: number;
  display_name: string;
  sprite_url: string | null;
  types: TypeName[] | null;
  base_stat_total: number;
  created_at: string;
}

/** The signed-in user's favorited Pokémon as browser cards, sorted by dex. */
export async function fetchFavorites(): Promise<PokemonCard[]> {
  const { data, error } = await supabase
    .from('user_favorites_view')
    .select('*')
    .order('national_dex_number', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as FavoriteRow[]).map((row) => ({
    id: row.id,
    national_dex_number: row.national_dex_number,
    display_name: row.display_name,
    sprite_url: row.sprite_url,
    types: row.types ?? [],
    base_stat_total: row.base_stat_total,
  }));
}

/** Just the favorited Pokémon ids (for the star toggle across screens). */
export async function fetchFavoriteIds(): Promise<number[]> {
  const { data, error } = await supabase.from('user_favorites').select('pokemon_id');
  if (error) throw error;
  return ((data ?? []) as { pokemon_id: number }[]).map((r) => r.pokemon_id);
}

export async function addFavorite(userId: string, pokemonId: number): Promise<void> {
  // RLS insert policy requires user_id = auth.uid() (SEC-004).
  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: userId, pokemon_id: pokemonId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, pokemonId: number): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('pokemon_id', pokemonId);
  if (error) throw error;
}
