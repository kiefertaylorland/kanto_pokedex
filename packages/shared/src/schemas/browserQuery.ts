import { z } from 'zod';
import { TYPE_NAMES } from '../constants/types';

/** Allow-listed sort keys (SEC-007). Never free-form. */
export const SORT_KEYS = ['number', 'name', 'base_stat_total'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

/**
 * Pokédex browser URL query params (FR-014).
 *
 * Every field uses `.catch(default)` so a malformed/hostile URL degrades to a
 * safe default instead of throwing — the page never renders raw input back as
 * an error (SEC-007 input validation, SEC-012 safe errors). `page` is clamped
 * downstream against the real match count.
 */
export const browserQuerySchema = z.object({
  q: z.string().trim().max(50).catch(''),
  types: z.array(z.enum(TYPE_NAMES)).catch([]),
  sort: z.enum(SORT_KEYS).catch('number'),
  dir: z.enum(SORT_DIRECTIONS).catch('asc'),
  page: z.coerce.number().int().min(1).catch(1),
});

export type BrowserQuery = z.infer<typeof browserQuerySchema>;

export const DEFAULT_BROWSER_QUERY: BrowserQuery = {
  q: '',
  types: [],
  sort: 'number',
  dir: 'asc',
  page: 1,
};

/**
 * Loose input schema for URL search params: every field is optional so links
 * can navigate to /pokedex without specifying any state, and only set params
 * appear in the URL. Read with `resolveBrowserQuery` to apply defaults.
 */
export const browserSearchInput = z.object({
  q: z.string().trim().max(50).optional().catch(undefined),
  types: z.array(z.enum(TYPE_NAMES)).optional().catch(undefined),
  sort: z.enum(SORT_KEYS).optional().catch(undefined),
  dir: z.enum(SORT_DIRECTIONS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export type BrowserSearchInput = z.infer<typeof browserSearchInput>;

/** Fills defaults over a validated loose input to produce a complete query. */
export function resolveBrowserQuery(input: BrowserSearchInput): BrowserQuery {
  return {
    q: input.q ?? DEFAULT_BROWSER_QUERY.q,
    types: input.types ?? DEFAULT_BROWSER_QUERY.types,
    sort: input.sort ?? DEFAULT_BROWSER_QUERY.sort,
    dir: input.dir ?? DEFAULT_BROWSER_QUERY.dir,
    page: input.page ?? DEFAULT_BROWSER_QUERY.page,
  };
}

/**
 * Interpret the free-text search box: all-digit input is an exact dex-number
 * match (FR-010, exact numeric); anything else is a case-insensitive name
 * substring. Returns a discriminated result the data layer can act on safely.
 */
export function interpretSearch(raw: string): { kind: 'empty' } | { kind: 'number'; value: number } | { kind: 'name'; value: string } {
  const q = raw.trim();
  if (q === '') return { kind: 'empty' };
  if (/^\d+$/.test(q)) return { kind: 'number', value: Number.parseInt(q, 10) };
  return { kind: 'name', value: q.toLowerCase() };
}
