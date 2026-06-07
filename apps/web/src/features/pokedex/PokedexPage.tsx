import { useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { browserSearchInput, resolveBrowserQuery, PAGE_SIZE, type BrowserQuery } from '@kanto/shared';
import { queryKeys } from '@/lib/queryKeys';
import { toUserMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { fetchPokemonPage } from './api';
import { FilterBar } from './FilterBar';
import { PokemonCardItem } from './PokemonCardItem';
import { LoadingState, ErrorState, EmptyState } from '@/components/state';
import { Button } from '@/components/ui/button';

/**
 * Pokédex browser (FR-008..015). All view state lives in the URL query string
 * (shareable/bookmarkable/back-button — FR-014) and is re-validated here with
 * the shared Zod schema on every render (defense in depth, SEC-007).
 */
export function PokedexPage() {
  const rawSearch = useSearch({ strict: false });
  const navigate = useNavigate();
  const query: BrowserQuery = resolveBrowserQuery(browserSearchInput.parse(rawSearch));

  const result = useQuery({
    queryKey: queryKeys.pokemon.list(query),
    queryFn: () => fetchPokemonPage(query),
    placeholderData: keepPreviousData,
  });

  function update(patch: Partial<BrowserQuery>) {
    if (patch.q !== undefined) track('browser_searched');
    if (patch.types !== undefined) track('browser_filtered');
    void navigate({
      to: '/pokedex',
      search: (prev) => ({ ...resolveBrowserQuery(browserSearchInput.parse(prev)), ...patch }),
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pokédex</h1>
      <FilterBar query={query} onChange={update} />

      {result.isLoading ? (
        <LoadingState label="Loading Pokémon…" />
      ) : result.isError ? (
        <ErrorState message={toUserMessage(result.error)} onRetry={() => void result.refetch()} />
      ) : !result.data || result.data.items.length === 0 ? (
        <EmptyState title="No Pokémon match your search." hint="Try a different name, number, or type filter." />
      ) : (
        <>
          <p className="text-sm text-zinc-500" aria-live="polite">
            {result.data.total} result{result.data.total === 1 ? '' : 's'} · page {result.data.page} of {result.data.pageCount}
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {result.data.items.map((p) => (
              <li key={p.id}>
                <PokemonCardItem pokemon={p} />
              </li>
            ))}
          </ul>

          <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              disabled={result.data.page <= 1}
              onClick={() => update({ page: result.data!.page - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm text-zinc-500">
              {result.data.page} / {result.data.pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={result.data.page >= result.data.pageCount}
              onClick={() => update({ page: result.data!.page + 1 })}
            >
              Next
            </Button>
          </nav>
          <p className="text-center text-xs text-zinc-400">Showing up to {PAGE_SIZE} per page.</p>
        </>
      )}
    </div>
  );
}
