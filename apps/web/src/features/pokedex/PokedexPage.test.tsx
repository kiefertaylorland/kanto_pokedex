import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import type { PokemonCard } from '@kanto/shared';
import { PokedexPage } from './PokedexPage';
import { fetchPokemonPage } from './api';

vi.mock('./api', () => ({ fetchPokemonPage: vi.fn() }));
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

const BULBASAUR: PokemonCard = {
  id: 1,
  national_dex_number: 1,
  display_name: 'Bulbasaur',
  sprite_url: 'https://cdn/sprite/1.png',
  types: ['grass', 'poison'],
  base_stat_total: 318,
};

const CHARMANDER: PokemonCard = {
  id: 4,
  national_dex_number: 4,
  display_name: 'Charmander',
  sprite_url: 'https://cdn/sprite/4.png',
  types: ['fire'],
  base_stat_total: 309,
};

function renderPokedex() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const pokedexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pokedex',
    component: PokedexPage,
  });
  const stub = (path: string) =>
    createRoute({ getParentRoute: () => rootRoute, path, component: () => <div /> });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      pokedexRoute,
      stub('/favorites'),
      stub('/compare'),
      stub('/pokemon/$dexId'),
    ]),
    history: createMemoryHistory({ initialEntries: ['/pokedex'] }),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RouterProvider router={router as any} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  vi.mocked(fetchPokemonPage).mockResolvedValue({
    items: [BULBASAUR, CHARMANDER],
    total: 30,
    page: 1,
    pageCount: 3,
  });
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('PokedexPage pagination placement', () => {
  it('places pagination before the Pokémon grid', async () => {
    renderPokedex();

    const pagination = await screen.findByRole('navigation', { name: 'Pagination' });
    const grid = screen.getByRole('list');

    expect(pagination.compareDocumentPosition(grid)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
