export * from './types';
export * from './stats';

/** Fixed Pokédex bounds for Generation I. */
export const MIN_DEX = 1;
export const MAX_DEX = 151;

/** Fixed browser page size — not client-controllable (SEC-007 bounded pagination). */
export const PAGE_SIZE = 12;

/** Encounter provenance / confidence labels. */
export const CONFIDENCE_LEVELS = ['pokeapi', 'curated', 'inferred', 'unknown'] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const CONFIDENCE_DISPLAY: Record<ConfidenceLevel, string> = {
  pokeapi: 'PokéAPI',
  curated: 'Curated',
  inferred: 'Inferred',
  unknown: 'Unknown',
};
