import { supabase } from '@/lib/supabase';
import {
  type MapLocationEncounters,
  type KantoLocation,
  type MapPoint,
  type EncounterSummary,
  type PokemonCard,
} from '@kanto/shared';

interface MapRow {
  location_id: string;
  slug: string;
  display_name: string;
  location_type: string;
  description: string | null;
  point_id: string;
  x: number;
  y: number;
  label_anchor: string | null;
  marker_type: string;
  encounters: Array<EncounterSummary & { pokemon: PokemonCard }> | null;
}

/**
 * Reads the curated `kanto_map_view`: one row per location with its map point
 * and the list of encounters (each carrying provenance + method). Curated
 * coordinates come straight from the product-owned tables (never sync — SEC-014).
 */
export async function fetchMapData(): Promise<MapLocationEncounters[]> {
  const { data, error } = await supabase.from('kanto_map_view').select('*').order('display_name');
  if (error) throw error;

  return ((data ?? []) as MapRow[]).map((row) => {
    const location: KantoLocation = {
      id: row.location_id,
      slug: row.slug,
      display_name: row.display_name,
      location_type: row.location_type,
      description: row.description,
    };
    const point: MapPoint = {
      id: row.point_id,
      kanto_location_id: row.location_id,
      x: row.x,
      y: row.y,
      label_anchor: row.label_anchor,
      marker_type: row.marker_type,
    };
    return { location, point, encounters: row.encounters ?? [] };
  });
}
