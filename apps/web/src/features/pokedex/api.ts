import { supabase } from '@/lib/supabase';
import {
  interpretSearch,
  PAGE_SIZE,
  type BrowserQuery,
  type PokemonCard,
  type TypeName,
} from '@kanto/shared';

export interface BrowserResult {
  items: PokemonCard[];
  total: number;
  page: number;
  pageCount: number;
}

interface BrowserRow {
  id: number;
  national_dex_number: number;
  display_name: string;
  sprite_url: string | null;
  types: TypeName[] | null;
  base_stat_total: number;
}

const SORT_COLUMN: Record<BrowserQuery['sort'], string> = {
  number: 'national_dex_number',
  name: 'display_name',
  base_stat_total: 'base_stat_total',
};

/** Build a fresh filter+sort+page query (a Postgrest builder is single-use). */
function buildQuery(query: BrowserQuery, page: number) {
  let q = supabase.from('pokemon_browser').select('*', { count: 'exact' });

  const search = interpretSearch(query.q);
  if (search.kind === 'number') {
    q = q.eq('national_dex_number', search.value);
  } else if (search.kind === 'name') {
    // Bound as a parameter; treated as literal text (SEC-008).
    q = q.ilike('display_name', `%${search.value}%`);
  }
  if (query.types.length > 0) {
    q = q.overlaps('types', query.types); // OR / union semantics (FR-011)
  }
  const from = (page - 1) * PAGE_SIZE;
  return q
    .order(SORT_COLUMN[query.sort], { ascending: query.dir === 'asc' })
    .order('national_dex_number', { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
}

/**
 * Reads a page of cards from the `pokemon_browser` view via the Supabase query
 * builder — no string SQL (SEC-008), inputs already validated (SEC-007). If the
 * requested page overshoots the result set (e.g. a hand-edited URL), it clamps
 * to the last page and refetches once.
 */
export async function fetchPokemonPage(query: BrowserQuery): Promise<BrowserResult> {
  const first = await buildQuery(query, query.page);
  if (first.error) throw first.error;

  const total = first.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  let rows = (first.data ?? []) as BrowserRow[];
  let page = query.page;

  if (query.page > pageCount && total > 0) {
    page = pageCount;
    const clamped = await buildQuery(query, page);
    if (clamped.error) throw clamped.error;
    rows = (clamped.data ?? []) as BrowserRow[];
  } else {
    page = Math.min(Math.max(1, query.page), pageCount);
  }

  return { items: rows.map(toCard), total, page, pageCount };
}

function toCard(row: BrowserRow): PokemonCard {
  return {
    id: row.id,
    national_dex_number: row.national_dex_number,
    display_name: row.display_name,
    sprite_url: row.sprite_url,
    types: row.types ?? [],
    base_stat_total: row.base_stat_total,
  };
}
