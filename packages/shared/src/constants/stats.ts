/** The six base stats, in canonical display order. */
export const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_DISPLAY: Record<StatKey, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

/** Max base stat among Gen-I Pokémon, used to scale stat bars (Mewtwo Sp.Atk / Chansey HP). */
export const MAX_BASE_STAT = 255;
