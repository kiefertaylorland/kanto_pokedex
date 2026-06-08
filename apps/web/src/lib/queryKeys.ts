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
    index: () => ['pokemon', 'index'] as const,
    detail: (dexId: number) => ['pokemon', 'detail', dexId] as const,
  },
  session: ['session'] as const,
} as const;
