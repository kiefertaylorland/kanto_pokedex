import type { TypeName, StatKey, ConfidenceLevel } from '../constants/index';

/** A Pokémon card as shown in the browser grid (FR-009). */
export interface PokemonCard {
  id: number;
  national_dex_number: number;
  display_name: string;
  sprite_url: string | null;
  types: TypeName[];
  base_stat_total: number;
}

export interface PokemonStat {
  key: StatKey;
  base_stat: number;
}

export interface PokemonAbility {
  name: string;
  display_name: string;
  is_hidden: boolean;
  slot: number;
}

export interface EvolutionNode {
  species_id: number;
  display_name: string;
  sprite_url?: string | null;
  trigger: string | null;
  min_level: number | null;
  item_name: string | null;
}

export interface EncounterSummary {
  kanto_location_id: string | null;
  location_display_name: string | null;
  method: string | null;
  confidence: ConfidenceLevel;
  notes: string | null;
}

/** Full detail-page projection (FR-016..026). */
export interface PokemonDetail extends PokemonCard {
  height: number | null;
  weight: number | null;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  official_artwork_url: string | null;
  flavor_text: string | null;
  evolution_chain: EvolutionNode[];
  encounters: EncounterSummary[];
}

/** Curated map layer (FR-027..033). */
export interface KantoLocation {
  id: string;
  slug: string;
  display_name: string;
  location_type: string;
  description: string | null;
}

export interface MapPoint {
  id: string;
  kanto_location_id: string;
  x: number;
  y: number;
  label_anchor: string | null;
  marker_type: string;
}

export interface MapLocationEncounters {
  location: KantoLocation;
  point: MapPoint;
  encounters: Array<EncounterSummary & { pokemon: PokemonCard }>;
}
