import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ComparePage } from '@/features/compare/ComparePage';
import { FavoritesPage } from '@/features/favorites/FavoritesPage';
import { LandingPage } from '@/features/landing/LandingPage';
import { useFavorites } from '@/features/favorites/useFavorites';
import { track } from '@/lib/analytics';
import { NotFound } from '@/routes/NotFound';

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));
vi.mock('@/features/favorites/useFavorites', () => ({ useFavorites: vi.fn() }));
vi.mock('@tanstack/react-router', async () => {
  return {
    Link: ({
      to,
      params,
      search,
      children,
      ...props
    }: {
      to: string;
      params?: Record<string, string>;
      search?: Record<string, number | undefined>;
      children: ReactNode;
    } & AnchorHTMLAttributes<HTMLAnchorElement>) => {
      let href = params?.dexId ? `/pokemon/${params.dexId}` : to;
      if (search) {
        const qs = new URLSearchParams(
          Object.entries(search)
            .filter(([, value]) => value != null)
            .map(([key, value]) => [key, String(value)]),
        ).toString();
        if (qs) href = `${href}?${qs}`;
      }
      return (
        <a
          href={href}
          onClick={(event) => {
            event.preventDefault();
            props.onClick?.(event);
          }}
          {...props}
        >
          {children}
        </a>
      );
    },
    useSearch: vi.fn(),
    useNavigate: vi.fn(),
  };
});

describe('page coverage sweep', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    navigate.mockReset();
    vi.mocked(track).mockReset();
    vi.mocked(useNavigate).mockReturnValue(navigate);
    vi.mocked(useFavorites).mockReturnValue({
      favorites: [],
      count: 0,
      isFavorite: vi.fn(() => false),
      toggle: vi.fn(),
    });
  });

  it('renders the landing page preview and tracks the CTA', async () => {
    const user = userEvent.setup();
    render(<LandingPage />);

    expect(screen.getByRole('heading', { name: /the kanto pokédex/i })).toBeInTheDocument();
    expect(screen.getByText('Illustrative preview — sign in to see live data.')).toBeInTheDocument();
    expect(screen.getAllByText(/pikachu|mewtwo|mew/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('link', { name: 'Sign in to explore' }));
    expect(track).toHaveBeenCalledWith('landing_cta_clicked');
  });

  it('renders both not-found variants', () => {
    const { rerender } = render(<NotFound />);
    expect(screen.getByText('We couldn’t find that page. It may have moved, or the link is out of date.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Pokédex' })).toHaveAttribute('href', '/pokedex');

    rerender(<NotFound dexId="25" />);
    expect(screen.getByText('We don’t have data for №025 yet. It may not be in this Pokédex.')).toBeInTheDocument();
  });

  it('renders favorites empty, loading, error, and success states', async () => {
    const user = userEvent.setup();

    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    render(<FavoritesPage />);
    expect(track).toHaveBeenCalledWith('favorites_viewed');
    expect(screen.getByText('No favorites yet.')).toBeInTheDocument();

    vi.mocked(useFavorites).mockReturnValueOnce({
      favorites: [25],
      count: 1,
      isFavorite: vi.fn(() => true),
      toggle: vi.fn(),
    });
    vi.mocked(useQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    render(<FavoritesPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading your favorites…');

    const refetch = vi.fn();
    vi.mocked(useFavorites).mockReturnValueOnce({
      favorites: [25],
      count: 1,
      isFavorite: vi.fn(() => true),
      toggle: vi.fn(),
    });
    vi.mocked(useQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { code: 'PGRST301' },
      refetch,
    } as never);
    render(<FavoritesPage />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Your session has expired. Please sign in again.');
    expect(refetch).toHaveBeenCalledOnce();

    vi.mocked(useFavorites).mockReturnValueOnce({
      favorites: [25, 26],
      count: 2,
      isFavorite: vi.fn((dex: number) => dex === 25),
      toggle: vi.fn(),
    });
    vi.mocked(useQuery).mockReturnValueOnce({
      data: [
        {
          id: 25,
          national_dex_number: 25,
          display_name: 'Pikachu',
          sprite_url: 'https://cdn/pika.png',
          types: ['electric'],
          base_stat_total: 320,
        },
        {
          id: 26,
          national_dex_number: 26,
          display_name: 'Raichu',
          sprite_url: null,
          types: ['electric'],
          base_stat_total: 485,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    render(<FavoritesPage />);

    expect(screen.getByRole('link', { name: 'Compare' })).toHaveAttribute('href', '/compare?a=25&b=26');
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('Raichu')).toBeInTheDocument();
  });

  it('renders compare loading and error states', () => {
    vi.mocked(useSearch).mockReturnValue({} as never);
    vi.mocked(useQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    render(<ComparePage />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading Pokémon…');

    vi.mocked(useQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { code: 'PGRST200' },
      refetch: vi.fn(),
    } as never);
    render(<ComparePage />);
    expect(screen.getByRole('alert')).toHaveTextContent('We could not load this data right now. Please try again.');
  });

  it('supports compare picker interactions before both slots are filled', async () => {
    vi.mocked(useSearch).mockReturnValue({} as never);
    vi.mocked(useQuery).mockReturnValue({
      data: [
        {
          id: 1,
          national_dex_number: 1,
          display_name: 'Bulbasaur',
          sprite_url: null,
          types: ['grass'],
          base_stat_total: 318,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    const user = userEvent.setup();
    render(<ComparePage />);

    expect(track).toHaveBeenCalledWith('compare_viewed');
    expect(screen.getAllByText('Pick a Pokémon to compare.')).toHaveLength(2);
    await user.selectOptions(screen.getByLabelText('A'), '1');
    await user.selectOptions(screen.getByLabelText('B'), '');
    await user.click(screen.getByRole('button', { name: 'Swap A and B' }));

    expect(navigate).toHaveBeenCalled();
    expect(screen.getByRole('link', { name: '← Back to Pokédex' })).toHaveAttribute('href', '/pokedex');
  });

  it('renders compare detail panels, retry states, and null detail handling', async () => {
    const user = userEvent.setup();
    vi.mocked(useSearch).mockReturnValue({ a: 25, b: 26 } as never);
    vi.mocked(useFavorites).mockReturnValue({
      favorites: [25],
      count: 1,
      isFavorite: vi.fn((dex: number) => dex === 25),
      toggle: vi.fn(),
    });

    const qaRefetch = vi.fn();
    vi.mocked(useQuery)
      .mockReturnValueOnce({
        data: [
          {
            id: 25,
            national_dex_number: 25,
            display_name: 'Pikachu',
            sprite_url: 'https://cdn/pika.png',
            types: ['electric'],
            base_stat_total: 320,
          },
          {
            id: 26,
            national_dex_number: 26,
            display_name: 'Raichu',
            sprite_url: null,
            types: ['electric'],
            base_stat_total: 485,
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never)
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);
    const loadingRender = render(<ComparePage />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading stats…');
    loadingRender.unmount();

    vi.mocked(useQuery)
      .mockReturnValueOnce({
        data: [
          {
            id: 25,
            national_dex_number: 25,
            display_name: 'Pikachu',
            sprite_url: 'https://cdn/pika.png',
            types: ['electric'],
            base_stat_total: 320,
          },
          {
            id: 26,
            national_dex_number: 26,
            display_name: 'Raichu',
            sprite_url: null,
            types: ['electric'],
            base_stat_total: 485,
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never)
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { code: '401' },
        refetch: qaRefetch,
      } as never);
    const errorRender = render(<ComparePage />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Your session has expired. Please sign in again.');
    expect(qaRefetch).toHaveBeenCalledOnce();
    errorRender.unmount();

    vi.mocked(useQuery)
      .mockReturnValueOnce({
        data: [
          {
            id: 25,
            national_dex_number: 25,
            display_name: 'Pikachu',
            sprite_url: 'https://cdn/pika.png',
            types: ['electric'],
            base_stat_total: 320,
          },
          {
            id: 26,
            national_dex_number: 26,
            display_name: 'Raichu',
            sprite_url: null,
            types: ['electric'],
            base_stat_total: 485,
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never)
      .mockReturnValueOnce({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never)
      .mockReturnValueOnce({
        data: {
          id: 26,
          national_dex_number: 26,
          display_name: 'Raichu',
          sprite_url: null,
          official_artwork_url: null,
          base_stat_total: 485,
          height: null,
          weight: null,
          flavor_text: null,
          types: ['electric'],
          stats: [],
          abilities: [],
          evolution_chain: [],
          encounters: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);
    const nullRender = render(<ComparePage />);
    expect(nullRender.container).not.toHaveTextContent('Base stats');
    nullRender.unmount();

    vi.mocked(useQuery)
      .mockReturnValueOnce({
        data: [
          {
            id: 25,
            national_dex_number: 25,
            display_name: 'Pikachu',
            sprite_url: 'https://cdn/pika.png',
            types: ['electric'],
            base_stat_total: 320,
          },
          {
            id: 26,
            national_dex_number: 26,
            display_name: 'Raichu',
            sprite_url: null,
            types: ['electric'],
            base_stat_total: 485,
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never)
      .mockReturnValueOnce({
        data: {
          id: 25,
          national_dex_number: 25,
          display_name: 'Pikachu',
          sprite_url: 'https://cdn/pika.png',
          official_artwork_url: null,
          base_stat_total: 320,
          height: null,
          weight: null,
          flavor_text: null,
          types: ['electric'],
          stats: [
            { key: 'hp', base_stat: 35 },
            { key: 'attack', base_stat: 55 },
            { key: 'defense', base_stat: 40 },
            { key: 'special-attack', base_stat: 50 },
            { key: 'special-defense', base_stat: 50 },
            { key: 'speed', base_stat: 90 },
          ],
          abilities: [{ name: 'static', display_name: 'Static', is_hidden: false, slot: 1 }],
          evolution_chain: [],
          encounters: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never)
      .mockReturnValueOnce({
        data: {
          id: 26,
          national_dex_number: 26,
          display_name: 'Raichu',
          sprite_url: null,
          official_artwork_url: null,
          base_stat_total: 485,
          height: null,
          weight: null,
          flavor_text: null,
          types: ['electric'],
          stats: [
            { key: 'hp', base_stat: 60 },
            { key: 'attack', base_stat: 90 },
            { key: 'defense', base_stat: 55 },
            { key: 'special-attack', base_stat: 90 },
            { key: 'special-defense', base_stat: 80 },
            { key: 'speed', base_stat: 110 },
          ],
          abilities: [],
          evolution_chain: [],
          encounters: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);
    render(<ComparePage />);

    expect(screen.getByText('Base stats')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /view details/i })[0]).toHaveAttribute('href', '/pokemon/25');
    expect(screen.getByText('Static')).toBeInTheDocument();
    expect(screen.getByText('Abilities unavailable.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove pikachu from favorites/i }));
  });
});
