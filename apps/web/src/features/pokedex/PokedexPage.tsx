import { useSearch, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { browserSearchInput, resolveBrowserQuery, type BrowserQuery } from '@kanto/shared';
import { queryKeys } from '@/lib/queryKeys';
import { toUserMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { fetchPokemonPage } from './api';
import { FilterBar } from './FilterBar';
import { PokemonCardItem } from './PokemonCardItem';
import { LoadingState, ErrorState, EmptyState } from '@/components/state';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/features/favorites/useFavorites';

/**
 * Pokédex browser (FR-008..015). All view state lives in the URL query string
 * (shareable/bookmarkable/back-button — FR-014) and is re-validated here with
 * the shared Zod schema on every render (defense in depth, SEC-007).
 */
export function PokedexPage() {
  const rawSearch = useSearch({ strict: false });
  const navigate = useNavigate();
  const { count: favoritesCount } = useFavorites();
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
    <div className="mx-auto max-w-xl space-y-5 px-6 py-8">
      <ScreenHeader
        kicker="№ 001–151 · Generation I"
        title="Pokédex"
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/favorites">★ Favorites{favoritesCount ? ` · ${favoritesCount}` : ''}</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/compare">Compare</Link>
            </Button>
          </>
        }
      />

      <FilterBar query={query} onChange={update} />

      {result.isLoading ? (
        <LoadingState label="Loading Pokémon…" />
      ) : result.isError ? (
        <ErrorState message={toUserMessage(result.error)} onRetry={() => void result.refetch()} />
      ) : !result.data || result.data.items.length === 0 ? (
        <EmptyState title="No Pokémon match your search." hint="Try a different name, number, or type filter." />
      ) : (
        <>
          <p className="text-sm text-ink-500" aria-live="polite">
            {result.data.total} result{result.data.total === 1 ? '' : 's'} · page {result.data.page} of{' '}
            {result.data.pageCount}
          </p>
          <Pagination
            page={result.data.page}
            pageCount={result.data.pageCount}
            onChange={(page) => update({ page })}
          />
          <ul
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
          >
            {result.data.items.map((p) => (
              <li key={p.id}>
                <PokemonCardItem pokemon={p} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
