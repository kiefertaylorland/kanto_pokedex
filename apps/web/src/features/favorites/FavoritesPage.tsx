import * as React from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { toUserMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { fetchPokemonIndex } from '@/features/pokedex/api';
import { PokemonCardItem } from '@/features/pokedex/PokemonCardItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState, EmptyState } from '@/components/state';
import { useFavorites } from './useFavorites';

/** The Pokémon a signed-in user has starred (persisted in localStorage). */
export function FavoritesPage() {
  const { favorites, count } = useFavorites();

  React.useEffect(() => {
    track('favorites_viewed');
  }, []);

  const result = useQuery({
    queryKey: queryKeys.pokemon.index(),
    queryFn: fetchPokemonIndex,
    enabled: count > 0,
  });

  const saved =
    count > 0 && result.data ? result.data.filter((p) => favorites.includes(p.national_dex_number)) : [];

  const [first, second] = saved;
  const compareSearch =
    first && second ? { a: first.national_dex_number, b: second.national_dex_number } : undefined;

  return (
    <div className="space-y-4">
      <ScreenHeader
        title="Favorites"
        kicker={`${count} saved`}
        actions={
          compareSearch && (
            <Button asChild variant="secondary" size="sm">
              <Link to="/compare" search={compareSearch}>
                Compare
              </Link>
            </Button>
          )
        }
      />

      {count === 0 ? (
        <div className="rounded-md border-2 border-border-strong bg-surface p-4">
          <EmptyState
            title="No favorites yet."
            hint="Tap the star on any Pokémon to save it here for quick comparison."
          />
          <div className="flex justify-center pb-2">
            <Button asChild>
              <Link to="/pokedex">Browse the Pokédex</Link>
            </Button>
          </div>
        </div>
      ) : result.isLoading ? (
        <LoadingState label="Loading your favorites…" />
      ) : result.isError ? (
        <ErrorState message={toUserMessage(result.error)} onRetry={() => void result.refetch()} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {saved.map((p) => (
            <li key={p.id}>
              <PokemonCardItem pokemon={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
