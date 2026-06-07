// ============================================================
// packages/shared/src/constants/types.ts — DROP-IN REPLACEMENT
// Same API (TYPE_NAMES, TypeName, typeDisplayName, TYPE_COLORS) so nothing
// downstream breaks. Two changes:
//   1. TYPE_COLORS hexes swapped to the AA-verified deep hues (white text ≥4.5:1).
//   2. Added TYPE_TINTS (non-text accents) for headers / card wells / marker fills.
// Gen-I ships 15 types; TYPE_NAMES (and thus TypeName/TYPE_COLORS/TYPE_TINTS) stays at 15
// to match the current National-Dex 1–151 scope.
// ============================================================

/** The 15 Pokémon types present in Generation I (National Dex 1–151). */
export const TYPE_NAMES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting',
  'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon',
] as const;

export type TypeName = (typeof TYPE_NAMES)[number];

/** Human-readable label for a type slug. */
export function typeDisplayName(name: TypeName): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Badge background per type. WHITE text on every hue, all pairings ≥4.5:1 (WCAG AA).
 * The old bright "game-accurate" palette failed AA as text — do NOT revert it.
 */
export const TYPE_COLORS: Record<TypeName, string> = {
  normal: '#6B6B5E',
  fire: '#C2370F',
  water: '#1C5FBF',
  electric: '#806600', // white-on-amber: dark-on-yellow fails AA
  grass: '#2E7D32',
  ice: '#3E7C82',
  fighting: '#B23222',
  poison: '#7B3F99',
  ground: '#9A6A1E',
  flying: '#5C6FB1',
  psychic: '#C2316E',
  bug: '#5A7A1E',
  rock: '#7A6A3E',
  ghost: '#4E4376',
  dragon: '#4A3FB5',
};

/** Light tint per type for NON-TEXT accents (header bands, card wells, marker fills). */
export const TYPE_TINTS: Record<TypeName, string> = {
  normal: '#EBEBE6',
  fire: '#FAD9CF',
  water: '#D6E2F5',
  electric: '#F3E9C2',
  grass: '#D5EAD6',
  ice: '#D7EAEB',
  fighting: '#F4D4CF',
  poison: '#E7D6EF',
  ground: '#EEE0C8',
  flying: '#DBE0F0',
  psychic: '#F7D3E0',
  bug: '#DEE8C8',
  rock: '#E7E1D2',
  ghost: '#DAD5E6',
  dragon: '#D9D6F0',
};
