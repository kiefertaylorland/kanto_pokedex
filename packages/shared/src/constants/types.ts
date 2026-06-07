/** The 15 Pokémon types present in Generation I (National Dex 1–151). */
export const TYPE_NAMES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
] as const;

export type TypeName = (typeof TYPE_NAMES)[number];

/** Human-readable label for a type slug. */
export function typeDisplayName(name: TypeName): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Tailwind-friendly accent token per type (used by UI badges). */
export const TYPE_COLORS: Record<TypeName, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
};
