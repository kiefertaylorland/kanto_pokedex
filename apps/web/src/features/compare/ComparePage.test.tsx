import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import type { PokemonCard, PokemonDetail } from '@kanto/shared';
import { ComparePage } from './ComparePage';
import { fetchPokemonIndex } from '@/features/pokedex/api';
import { fetchPokemonDetail } from '@/features/pokemon-detail/api';

vi.mock('@/features/pokedex/api', () => ({ fetchPokemonIndex: vi.fn() }));
vi.mock('@/features/pokemon-detail/api', () => ({ fetchPokemonDetail: vi.fn() }));
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

const PIKACHU: PokemonCard = {
  id: 25,
  national_dex_number: 25,
  display_name: 'Pikachu',
  sprite_url: 'https://cdn/sprite/25.png',
  types: ['electric'],
  base_stat_total: 320,
};

const RAICHU: PokemonCard = {
  id: 26,
  national_dex_number: 26,
  display_name: 'Raichu',
  sprite_url: null,
  types: ['electric'],
  base_stat_total: 485,
};

function makeDetail(card: PokemonCard, speed: number): PokemonDetail {
  return {
    id: card.id,
    national_dex_number: card.national_dex_number,
    display_name: card.display_name,
    sprite_url: card.sprite_url,
    official_artwork_url: null,
    base_stat_total: card.base_stat_total,
    height: null,
    weight: null,
    flavor_text: null,
    types: card.types,
    stats: [
      { key: 'hp', base_stat: 50 },
      { key: 'attack', base_stat: 60 },
      { key: 'defense', base_stat: 45 },
      { key: 'special-attack', base_stat: 60 },
      { key: 'special-defense', base_stat: 55 },
      { key: 'speed', base_stat: speed },
    ],
    abilities: [{ name: 'static', display_name: 'Static', is_hidden: false, slot: 1 }],
    evolution_chain: [],
    encounters: [],
  } as PokemonDetail;
}

function renderCompare(initialSearch = '') {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const compareRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/compare',
    validateSearch: (search: Record<string, unknown>) => ({
      a: search.a != null ? Number(search.a) : undefined,
      b: search.b != null ? Number(search.b) : undefined,
    }),
    component: ComparePage,
  });
  const stub = (path: string) =>
    createRoute({ getParentRoute: () => rootRoute, path, component: () => <div /> });
  const router = createRouter({
    routeTree: rootRoute.addChildren([compareRoute, stub('/pokedex'), stub('/pokemon/$dexId')]),
    history: createMemoryHistory({ initialEntries: [`/compare${initialSearch}`] }),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={queryClient}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RouterProvider router={router as any} />
    </QueryClientProvider>,
  );
  return { router, view };
}

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  vi.mocked(fetchPokemonIndex).mockResolvedValue([PIKACHU, RAICHU]);
  vi.mocked(fetchPokemonDetail).mockImplementation((dex: number) =>
    Promise.resolve(makeDetail(dex === 25 ? PIKACHU : RAICHU, dex === 25 ? 90 : 110)),
  );
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('ComparePage', () => {
  it('shows empty slots and both pickers when nothing is selected', async () => {
    renderCompare();

    expect(await screen.findAllByText('Pick a Pokémon to compare.')).toHaveLength(2);
    expect(screen.getByLabelText('A')).toBeInTheDocument();
    expect(screen.getByLabelText('B')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Back to Pokédex' })).toBeInTheDocument();
    // No stats panel until both slots are filled.
    expect(screen.queryByText('Base stats')).not.toBeInTheDocument();
  });

  it('updates the URL when a Pokémon is picked in slot A', async () => {
    const user = userEvent.setup();
    const { router } = renderCompare();

    const selectA = await screen.findByLabelText('A');
    await user.selectOptions(selectA, '25');

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ a: 25 });
    });
    expect(await screen.findByText('Pikachu')).toBeInTheDocument();
  });

  it('renders identity cards, base stats, and abilities when both slots are filled', async () => {
    renderCompare('?a=25&b=26');

    expect(await screen.findByText('Base stats')).toBeInTheDocument();
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('Raichu')).toBeInTheDocument();
    expect(screen.getByText('№025')).toBeInTheDocument();
    expect(screen.getByText('№026')).toBeInTheDocument();
    expect(screen.getByText("Pikachu's abilities")).toBeInTheDocument();
    expect(screen.getByText("Raichu's abilities")).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText('485')).toBeInTheDocument();
    expect(vi.mocked(fetchPokemonDetail)).toHaveBeenCalledWith(25);
    expect(vi.mocked(fetchPokemonDetail)).toHaveBeenCalledWith(26);
  });

  it('swaps slots A and B via the swap button', async () => {
    const user = userEvent.setup();
    const { router } = renderCompare('?a=25&b=26');

    await screen.findByText('Base stats');
    await user.click(screen.getByRole('button', { name: 'Swap A and B' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ a: 26, b: 25 });
    });
    // Slot A picker now holds Raichu.
    expect(screen.getByLabelText('A')).toHaveValue('26');
    expect(screen.getByLabelText('B')).toHaveValue('25');
  });
});
