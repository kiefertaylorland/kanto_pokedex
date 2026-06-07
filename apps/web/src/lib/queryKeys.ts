import type { BrowserQuery } from '@kanto/shared';

/**
 * Centralized query-key factory (TanStack Query discipline). Every key is an
 * array prefixed by domain so related queries invalidate together and distinct
 * filter combinations cache independently (no cross-filter leakage).
 */
export const queryKeys = {
  pokemon: {
    all: ['pokemon'] as const,
    list: (q: BrowserQuery) => ['pokemon', 'list', q] as const,
    detail: (dexId: number) => ['pokemon', 'detail', dexId] as const,
  },
  map: {
    all: ['map'] as const,
    locations: () => ['map', 'locations'] as const,
    location: (kantoLocationId: string) => ['map', 'location', kantoLocationId] as const,
  },
  session: ['session'] as const,
} as const;
